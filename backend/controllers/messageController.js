const Message = require('../models/message');

exports.getAllMessages = async (_req, res) => {
  try {
    const rows = await Message.getAllMessages();
    res.json(rows);
  } catch (err) {
    console.error('getAllMessages controller error:', err);
    res.status(500).send('Server error');
  }
};

exports.getMessageById = async (req, res) => {
  try {
    const result = await Message.getMessageDetails(req.params.id);

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ msg: 'Message not found' });
      }
      console.error('getMessageById model error:', result.error);
      return res.status(500).json({ msg: 'Could not fetch message' });
    }

    res.json(result.message);
  } catch (err) {
    console.error('getMessageById controller error:', err);
    res.status(500).send('Server error');
  }
};

exports.createMessage = async (req, res) => {
  const { sender_id, receiver_id, content } = req.body;

  try {
    const result = await Message.createMessageWithDefaults({
      sender_id,
      receiver_id,
      content
    });

    if (!result.success) {
      if (result.error === 'INVALID_INPUT') {
        return res.status(400).json({ msg: 'Invalid message data' });
      }
      console.error('createMessage model error:', result.error);
      return res.status(500).json({ msg: 'Could not create message' });
    }

    res.status(201).json({ message_id: result.message_id });
  } catch (err) {
    console.error('createMessage controller error:', err);
    res.status(500).send('Server error');
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const result = await Message.deleteMessageIfExists(req.params.id);

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ msg: 'Message not found' });
      }
      console.error('deleteMessage model error:', result.error);
      return res.status(500).json({ msg: 'Could not delete message' });
    }

    res.json({ msg: 'Message deleted' });
  } catch (err) {
    console.error('deleteMessage controller error:', err);
    res.status(500).send('Server error');
  }
};