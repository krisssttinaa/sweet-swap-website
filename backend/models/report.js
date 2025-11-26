const db = require('../config/db');

const Report = {
  // --- Low-level DAO methods ---
  async getAllReports() {
    const [rows] = await db.query('SELECT * FROM "Report"');
    return rows;
  },

  async getReportById(id) {
    const [rows] = await db.query(
      'SELECT * FROM "Report" WHERE report_id = $1',
      [id]
    );
    return rows; // array
  },

  async createReportRaw({ user_id, reported_post_id, reason, date_reported }) {
    const [rows] = await db.query(
      'INSERT INTO "Report" (user_id, reported_post_id, reason, date_reported) ' +
      'VALUES ($1, $2, $3, $4) RETURNING report_id',
      [user_id, reported_post_id, reason, date_reported]
    );
    return rows[0].report_id;
  },

  async deleteReportRaw(id) {
    await db.query('DELETE FROM "Report" WHERE report_id = $1', [id]);
    return true;
  },

  // --- Business logic methods used by controllers ---
  async getReportDetails(id) {
    const rows = await this.getReportById(id);
    if (!rows.length) {
      return { success: false, error: 'NOT_FOUND' };
    }
    return { success: true, report: rows[0] };
  },
  async createReportWithDefaults({ user_id, reported_post_id, reason }) {
    if (!user_id || !reported_post_id || !reason) {
      return { success: false, error: 'INVALID_INPUT' };
    }

    const date_reported = new Date();
    const report_id = await this.createReportRaw({
      user_id,
      reported_post_id,
      reason,
      date_reported
    });

    return { success: true, report_id };
  },
  
  async deleteReportIfExists(id) {
    const rows = await this.getReportById(id);
    if (!rows.length) {
      return { success: false, error: 'NOT_FOUND' };
    }

    await this.deleteReportRaw(id);
    return { success: true };
  }
};

module.exports = Report;