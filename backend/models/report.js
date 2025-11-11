const db = require('../config/db');

const Report = {
  async getAllReports() {
    const [rows] = await db.query('SELECT * FROM "Report"');
    return rows;
  },

  async getReportById(id) {
    const [rows] = await db.query('SELECT * FROM "Report" WHERE report_id = $1', [id]);
    return rows; // array
  },

  async createReport({ user_id, reported_post_id, reason, date_reported }) {
    const [rows] = await db.query(
      'INSERT INTO "Report" (user_id, reported_post_id, reason, date_reported) ' +
      'VALUES ($1, $2, $3, $4) RETURNING report_id',
      [user_id, reported_post_id, reason, date_reported]
    );
    return rows[0].report_id;
  },

  async deleteReport(id) {
    await db.query('DELETE FROM "Report" WHERE report_id = $1', [id]);
    return true;
  }
};

module.exports = Report;