const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = {
  // --- Low-level data access methods (DAO) ---

  async getAllUsers() {
    const [rows] = await db.query('SELECT * FROM "User"');
    return rows; // array
  },

  async getUserById(id) {
    const [rows] = await db.query(
      'SELECT * FROM "User" WHERE user_id = $1',
      [id]
    );
    return rows; // array ([]) if not found
  },

  async createUser({
    username, password, email, name, surname,
    country, role = null, dietary_goals = null,
    registration_date = null, amount_achievements = 0,
    profile_picture = null
  }) {
    const [rows] = await db.query(
      'INSERT INTO "User" ("username","password","email","name","surname","country","role",' +
      ' "dietary_goals","registration_date","amount_achievements","profile_picture") ' +
      'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ' +
      'RETURNING user_id',
      [
        username, password, email, name, surname,
        country, role, dietary_goals, registration_date,
        amount_achievements, profile_picture
      ]
    );
    return rows[0].user_id; // new id
  },

  async authUser(username) {
    const [rows] = await db.query(
      'SELECT * FROM "User" WHERE "username" = $1 LIMIT 1',
      [username]
    );
    return rows; // array ([]) if not found
  },

  async updateUser(id, {
    username, name, surname, email, password,
    dietary_goals, country, profile_picture
  }) {
    await db.query(
      'UPDATE "User" SET "username" = $1, "name" = $2, "surname" = $3, "email" = $4, ' +
      '"password" = $5, "dietary_goals" = $6, "country" = $7, "profile_picture" = $8 ' +
      'WHERE user_id = $9',
      [username, name, surname, email, password, dietary_goals, country, profile_picture, id]
    );
    return true;
  },

  async deleteUser(id) {
    await db.query('DELETE FROM "User" WHERE user_id = $1', [id]);
    return true;
  },

  // --- Business logic methods used by controllers ---

  /**
   * Register a new user and generate JWT token.
   * Returns:
   * - { success: true, token, user }
   * - { success: false, error: 'USER_EXISTS' | 'USER_CREATION_FAILED' }
   */
  async registerAndGenerateToken({ username, email, password, name, surname, country }) {
    // Check if user already exists
    const existing = await this.authUser(username);
    if (existing.length > 0) {
      return { success: false, error: 'USER_EXISTS' };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const registration_date = new Date();
    const amount_achievements = 0;
    const role = null;
    const dietary_goals = null;
    const profile_picture = null;

    // Create user
    const newUserId = await this.createUser({
      username,
      password: hashedPassword,
      email,
      name,
      surname,
      country,
      role,
      dietary_goals,
      registration_date,
      amount_achievements,
      profile_picture
    });

    // Fetch the created user
    const createdRows = await this.getUserById(newUserId);
    if (createdRows.length === 0) {
      return { success: false, error: 'USER_CREATION_FAILED' };
    }

    const u = createdRows[0];

    // Build JWT
    const payload = { user: { id: u.user_id, username: u.username } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

    return {
      success: true,
      token,
      user: {
        id: u.user_id,
        username: u.username,
        email: u.email,
        name: u.name,
        surname: u.surname
      }
    };
  },

  async loginAndGenerateToken({ username, password }) {
    const rows = await this.authUser(username);
    if (rows.length === 0) {
      return { success: false, error: 'INVALID_CREDENTIALS' };
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, error: 'INVALID_CREDENTIALS' };
    }

    const payload = { user: { id: user.user_id, username: user.username } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

    return {
      success: true,
      token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        name: user.name,
        surname: user.surname
      }
    };
  },

  async getProfile(userId) {
    const rows = await this.getUserById(userId);
    if (rows.length === 0) {
      return { success: false, error: 'NOT_FOUND' };
    }
    return { success: true, user: rows[0] };
  },

  async updateProfileWithBusinessLogic(userId, {
    username,
    name,
    surname,
    email,
    password,
    dietaryGoals,
    country,
    profilePicture
  }) {
    const rows = await this.getUserById(userId);
    if (rows.length === 0) {
      return { success: false, error: 'NOT_FOUND' };
    }

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

    let passwordToStore = base.password;
    if (password && password !== '********') {
      const salt = await bcrypt.genSalt(10);
      passwordToStore = await bcrypt.hash(password, salt);
    }

    await this.updateUser(userId, {
      username: updated.username,
      name: updated.name,
      surname: updated.surname,
      email: updated.email,
      password: passwordToStore,
      dietary_goals: updated.dietary_goals,
      country: updated.country,
      profile_picture: updated.profile_picture
    });

    return { success: true };
  },

  async deleteUserIfExists(userId) {
    const rows = await this.getUserById(userId);
    if (rows.length === 0) {
      return { success: false, error: 'NOT_FOUND' };
    }

    await this.deleteUser(userId);
    return { success: true };
  },

  async updateProfilePictureRaw(userId, profilePicture) {
    await db.query(
      'UPDATE "User" SET "profile_picture" = $1 WHERE user_id = $2',
      [profilePicture, userId]
    );
    return true;
  },

  async updateProfilePictureWithValidation(userId, profilePicture) {
    const allowedPictures = [
      'profile0.png', 'profile1.png', 'profile2.png', 'profile3.png',
      'profile4.png', 'profile5.png', 'profile6.png',
      'profile7.png', 'profile8.png', 'profile9.png', 'profile10.png',
      'profile11.png', 'profile12.png', 'profile13.png', 'profile14.png',
      'default.png'
    ];

    if (!allowedPictures.includes(profilePicture)) {
      return { success: false, error: 'INVALID_PICTURE' };
    }

    const rows = await this.getUserById(userId);
    if (rows.length === 0) {
      return { success: false, error: 'NOT_FOUND' };
    }

    await this.updateProfilePictureRaw(userId, profilePicture);
    return { success: true };
  }
};

module.exports = User;