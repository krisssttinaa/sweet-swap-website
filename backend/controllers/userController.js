const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, email, password, name, surname, country } = req.body;

  try {
    const existing = await User.authUser(username);      // [] or [row]
    if (existing.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.createUser({
      username,
      password: hashedPassword,
      email,
      name,
      surname,
      country,
      role: null,                       // role can be NULL now
      dietary_goals: null,
      registration_date: new Date(),
      amount_achievements: 0,
      profile_picture: null
    });

    const newUser = await User.authUser(username);       // expect [row]
    if (newUser.length === 0) {
      return res.status(500).json({ msg: 'User creation failed' });
    }

    const payload = { user: { id: newUser[0].user_id, username: newUser[0].username } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.authUser(username);
    if (user.length === 0) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = { user: { id: user[0].user_id, username: user[0].username } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user[0].user_id,
          username: user[0].username,
          email: user[0].email,
          name: user[0].name,
          surname: user[0].surname
        }
      });
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
};

exports.profile = async (req, res) => {
  try {
    const rows = await User.getUserById(req.user.id);
    if (rows.length === 0) return res.status(404).json({ msg: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).send('Server error');
  }
};

exports.getAllUsers = async (_req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error('GetAllUsers error:', err);
    res.status(500).send('Server error');
  }
};

exports.getUserById = async (req, res) => {
  try {
    const rows = await User.getUserById(req.params.id);
    if (rows.length === 0) return res.status(404).json({ msg: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GetUserById error:', err);
    res.status(500).send('Server error');
  }
};

exports.updateProfile = async (req, res) => {
  console.log('UpdateProfile request body:');
  const { username, name, surname, email, password, dietaryGoals, country, profilePicture } = req.body;
  const userId = req.user.id;

  try {
    const rows = await User.getUserById(userId);
    if (rows.length === 0) return res.status(404).json({ msg: 'User not found' });

    const base = rows[0];
    const updated = {
      username: username || base.username,
      name: name || base.name,
      surname: surname || base.surname,
      email: email || base.email,
      dietary_goals: dietaryGoals || base.dietary_goals,
      country: country || base.country,
      profile_picture: profilePicture || base.profile_picture
    };

    if (password && password !== '********') {
      const salt = await bcrypt.genSalt(10);
      updated.password = await bcrypt.hash(password, salt);
    } else {
      updated.password = base.password;
    }

    await User.updateUser(userId, updated);
    res.json({ msg: 'Profile updated successfully' });
  } catch (err) {
    console.error('UpdateProfile error:', err);
    res.status(500).send('Server error');
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const rows = await User.getUserById(req.user.id);
    if (rows.length === 0) return res.status(404).json({ msg: 'User not found' });

    await User.deleteUser(req.user.id);
    res.status(200).json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error('DeleteProfile error:', err);
    res.status(500).send('Server error');
  }
};