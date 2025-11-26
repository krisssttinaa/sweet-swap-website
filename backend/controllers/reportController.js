const Report = require('../models/report');

exports.getAllReports = async (_req, res) => {
  try {
    const rows = await Report.getAllReports();
    res.json(rows);
  } catch (err) {
    console.error('GetAllReports error:', err);
    res.status(500).send('Server error');
  }
};

exports.getReportById = async (req, res) => {
  try {
    const result = await Report.getReportDetails(req.params.id);

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ msg: 'Report not found' });
      }
      console.error('GetReportById model error:', result.error);
      return res.status(500).json({ msg: 'Could not fetch report' });
    }

    res.json(result.report);
  } catch (err) {
    console.error('GetReportById controller error:', err);
    res.status(500).send('Server error');
  }
};

exports.createReport = async (req, res) => {
  const { user_id, reported_post_id, reason } = req.body;

  try {
    const result = await Report.createReportWithDefaults({
      user_id,
      reported_post_id,
      reason
    });

    if (!result.success) {
      if (result.error === 'INVALID_INPUT') {
        return res.status(400).json({ msg: 'Missing required fields' });
      }
      console.error('CreateReport model error:', result.error);
      return res.status(500).json({ msg: 'Could not create report' });
    }

    // 201 for creation
    res.status(201).json({ report_id: result.report_id });
  } catch (err) {
    console.error('CreateReport controller error:', err);
    res.status(500).send('Server error');
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const result = await Report.deleteReportIfExists(req.params.id);

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ msg: 'Report not found' });
      }
      console.error('DeleteReport model error:', result.error);
      return res.status(500).json({ msg: 'Could not delete report' });
    }

    res.json({ msg: 'Report deleted' });
  } catch (err) {
    console.error('DeleteReport controller error:', err);
    res.status(500).send('Server error');
  }
};