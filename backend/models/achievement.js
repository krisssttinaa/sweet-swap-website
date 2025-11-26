const db = require('../config/db');

const Achievement = {
  // --- Low-level DAO methods ---

  async getAllAchievements() {
    const [rows] = await db.query('SELECT * FROM "Achievement"');
    return rows;
  },

  async getAchievementById(id) {
    const [rows] = await db.query(
      'SELECT * FROM "Achievement" WHERE achievement_id = $1',
      [id]
    );
    return rows; // array
  },

  async createAchievementRaw({ user_id, title, description, date_achieved }) {
    const [rows] = await db.query(
      'INSERT INTO "Achievement" (user_id, title, description, date_achieved) ' +
      'VALUES ($1, $2, $3, $4) RETURNING achievement_id',
      [user_id, title, description, date_achieved]
    );
    return rows[0].achievement_id;
  },

  async deleteAchievementRaw(id) {
    await db.query(
      'DELETE FROM "Achievement" WHERE achievement_id = $1',
      [id]
    );
    return true;
  },

  // --- Business logic methods used by controllers ---

  async getAchievementDetails(id) {
    const rows = await this.getAchievementById(id);
    if (!rows.length) {
      return { success: false, error: 'NOT_FOUND' };
    }
    return { success: true, achievement: rows[0] };
  },

  async createAchievementWithDefaults({ user_id, title, description }) {
    if (!user_id || !title) {
      return { success: false, error: 'INVALID_INPUT' };
    }

    const date_achieved = new Date();

    const achievement_id = await this.createAchievementRaw({
      user_id,
      title,
      description: description || null,
      date_achieved
    });

    return { success: true, achievement_id };
  },

  async deleteAchievementIfExists(id) {
    const rows = await this.getAchievementById(id);
    if (!rows.length) {
      return { success: false, error: 'NOT_FOUND' };
    }

    await this.deleteAchievementRaw(id);
    return { success: true };
  }
};

module.exports = Achievement;