const Contact = require('../models/contact');

exports.sendContactForm = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const result = await Contact.sendContactMessage({ name, email, message });

    if (!result.success) {
      if (result.error === 'INVALID_INPUT') {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      if (result.error === 'SEND_FAILED') {
        return res.status(500).json({ error: 'Failed to send message' });
      }
      console.error('sendContactForm model error:', result.error);
      return res.status(500).json({ error: 'Server error' });
    }

    return res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('sendContactForm controller error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};