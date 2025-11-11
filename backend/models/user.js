const db = require('../config/db');

const User = {
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
  }
};

module.exports = User;