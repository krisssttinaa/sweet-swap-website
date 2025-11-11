const db = require('../config/db');

const Achievement = {
  async getAllAchievements() {
    const [rows] = await db.query('SELECT * FROM "Achievement"');
    return rows;
  },

  async getAchievementById(id) {
    const [rows] = await db.query('SELECT * FROM "Achievement" WHERE achievement_id = $1', [id]);
    return rows; // array
  },

  async createAchievement({ user_id, title, description, date_achieved }) {
    const [rows] = await db.query(
      'INSERT INTO "Achievement" (user_id, title, description, date_achieved) ' +
      'VALUES ($1, $2, $3, $4) RETURNING achievement_id',
      [user_id, title, description, date_achieved]
    );
    return rows[0].achievement_id;
  },

  async deleteAchievement(id) {
    await db.query('DELETE FROM "Achievement" WHERE achievement_id = $1', [id]);
    return true;
  }
};

module.exports = Achievement;