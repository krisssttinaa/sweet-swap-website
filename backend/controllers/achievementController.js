const Achievement = require('../models/achievement');

exports.getAllAchievements = async (_req, res) => {
  try {
    const rows = await Achievement.getAllAchievements();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getAchievementById = async (req, res) => {
  try {
    const rows = await Achievement.getAchievementById(req.params.id);
    if (!rows.length) return res.status(404).json({ msg: 'Achievement not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.createAchievement = async (req, res) => {
  const { user_id, title, description } = req.body; // title (not achievement_name)
  try {
    const id = await Achievement.createAchievement({
      user_id,
      title,
      description,
      date_achieved: new Date()
    });
    res.json({ achievement_id: id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.deleteAchievement = async (req, res) => {
  try {
    await Achievement.deleteAchievement(req.params.id);
    res.json({ msg: 'Achievement deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};