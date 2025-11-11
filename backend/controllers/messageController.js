const Message = require('../models/message');

exports.getAllMessages = async (_req, res) => {
  try {
    const rows = await Message.getAllMessages();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getMessageById = async (req, res) => {
  try {
    const rows = await Message.getMessageById(req.params.id);
    if (!rows.length) return res.status(404).json({ msg: 'Message not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.createMessage = async (req, res) => {
  const { sender_id, receiver_id, content } = req.body;
  try {
    const id = await Message.createMessage({
      sender_id,
      receiver_id,
      content,
      date_sent: new Date()
    });
    res.json({ message_id: id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    await Message.deleteMessage(req.params.id);
    res.json({ msg: 'Message deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};