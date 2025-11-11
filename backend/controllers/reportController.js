const Report = require('../models/report');

exports.getAllReports = async (_req, res) => {
  try {
    const rows = await Report.getAllReports();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getReportById = async (req, res) => {
  try {
    const rows = await Report.getReportById(req.params.id);
    if (!rows.length) return res.status(404).json({ msg: 'Report not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.createReport = async (req, res) => {
  const { user_id, reported_post_id, reason } = req.body;
  try {
    const id = await Report.createReport({
      user_id, reported_post_id, reason, date_reported: new Date()
    });
    res.json({ report_id: id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.deleteReport = async (req, res) => {
  try {
    await Report.deleteReport(req.params.id);
    res.json({ msg: 'Report deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};