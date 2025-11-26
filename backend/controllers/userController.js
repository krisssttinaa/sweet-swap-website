const User = require('../models/user');

exports.register = async (req, res) => {
  const { username, email, password, name, surname, country } = req.body;

  try {
    const result = await User.registerAndGenerateToken({
      username,
      email,
      password,
      name,
      surname,
      country
    });

    if (!result.success) {
      if (result.error === 'USER_EXISTS') {
        return res.status(400).json({ msg: 'User already exists' });
      }
      console.error('Register error (model-level):', result.error);
      return res.status(500).json({ msg: 'User creation failed' });
    }

    // Only send what you need, here the token (and you could also send result.user if you want)
    return res.json({ token: result.token });
  } catch (err) {
    console.error('Register error (controller-level):', err);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await User.loginAndGenerateToken({ username, password });

    if (!result.success) {
      if (result.error === 'INVALID_CREDENTIALS') {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }
      console.error('Login error (model-level):', result.error);
      return res.status(500).json({ msg: 'Login failed' });
    }

    return res.json({
      token: result.token,
      user: result.user
    });
  } catch (err) {
    console.error('Login error (controller-level):', err);
    res.status(500).send('Server error');
  }
};

exports.profile = async (req, res) => {
  try {
    const result = await User.getProfile(req.user.id);

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ msg: 'User not found' });
      }
      console.error('Profile error (model-level):', result.error);
      return res.status(500).json({ msg: 'Could not fetch profile' });
    }

    return res.json(result.user);
  } catch (err) {
    console.error('Profile error (controller-level):', err);
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
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('GetUserById error:', err);
    res.status(500).send('Server error');
  }
};

exports.updateProfile = async (req, res) => {
  const { username, name, surname, email, password, dietaryGoals, country, profilePicture } = req.body;
  const userId = req.user.id;

  try {
    const result = await User.updateProfileWithBusinessLogic(userId, {
      username,
      name,
      surname,
      email,
      password,
      dietaryGoals,
      country,
      profilePicture
    });

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ msg: 'User not found' });
      }
      console.error('UpdateProfile error (model-level):', result.error);
      return res.status(500).json({ msg: 'Could not update profile' });
    }

    res.json({ msg: 'Profile updated successfully' });
  } catch (err) {
    console.error('UpdateProfile error (controller-level):', err);
    res.status(500).send('Server error');
  }
};

exports.deleteProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await User.deleteUserIfExists(userId);

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ msg: 'User not found' });
      }
      console.error('DeleteProfile error (model-level):', result.error);
      return res.status(500).json({ msg: 'Could not delete user' });
    }

    res.status(200).json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error('DeleteProfile error (controller-level):', err);
    res.status(500).send('Server error');
  }
};

exports.updateProfilePicture = async (req, res) => {
  const userId = req.user.id;
  const { profilePicture } = req.body;

  try {
    const result = await User.updateProfilePictureWithValidation(userId, profilePicture);

    if (!result.success) {
      if (result.error === 'INVALID_PICTURE') {
        return res.status(400).json({ error: 'Invalid profile picture selected' });
      }
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ error: 'User not found' });
      }
      console.error('updateProfilePicture model error:', result.error);
      return res.status(500).json({ error: 'Could not update profile picture' });
    }

    res.status(200).json({ message: 'Profile picture updated successfully' });
  } catch (error) {
    console.error('updateProfilePicture controller error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};