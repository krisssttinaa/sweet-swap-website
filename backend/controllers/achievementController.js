const Achievement = require('../models/achievement');

exports.getAllAchievements = async (_req, res) => {
  try {
    const rows = await Achievement.getAllAchievements();
    res.json(rows);
  } catch (err) {
    console.error('getAllAchievements controller error:', err);
    res.status(500).send('Server error');
  }
};

exports.getAchievementById = async (req, res) => {
  try {
    const result = await Achievement.getAchievementDetails(req.params.id);

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ msg: 'Achievement not found' });
      }
      console.error('getAchievementById model error:', result.error);
      return res.status(500).json({ msg: 'Could not fetch achievement' });
    }

    res.json(result.achievement);
  } catch (err) {
    console.error('getAchievementById controller error:', err);
    res.status(500).send('Server error');
  }
};

exports.createAchievement = async (req, res) => {
  const { user_id, title, description } = req.body;

  try {
    const result = await Achievement.createAchievementWithDefaults({
      user_id,
      title,
      description
    });

    if (!result.success) {
      if (result.error === 'INVALID_INPUT') {
        return res.status(400).json({ msg: 'Missing required fields' });
      }
      console.error('createAchievement model error:', result.error);
      return res.status(500).json({ msg: 'Could not create achievement' });
    }

    res.json({ achievement_id: result.achievement_id });
  } catch (err) {
    console.error('createAchievement controller error:', err);
    res.status(500).send('Server error');
  }
};

exports.deleteAchievement = async (req, res) => {
  try {
    const result = await Achievement.deleteAchievementIfExists(req.params.id);

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ msg: 'Achievement not found' });
      }
      console.error('deleteAchievement model error:', result.error);
      return res.status(500).json({ msg: 'Could not delete achievement' });
    }

    res.json({ msg: 'Achievement deleted' });
  } catch (err) {
    console.error('deleteAchievement controller error:', err);
    res.status(500).send('Server error');
  }
};