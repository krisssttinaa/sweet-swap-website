const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

const Contact = {
  async sendContactMessage({ name, email, message }) {
    // basic validation = business logic
    if (!name || !email || !message) {
      return { success: false, error: 'INVALID_INPUT' };
    }

    try {
      const info = await transporter.sendMail({
        from: email,
        to: process.env.EMAIL,
        subject: 'Contact Form Submission',
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
      });

      if (!info || !info.messageId) {
        return { success: false, error: 'SEND_FAILED' };
      }

      return { success: true };
    } catch (err) {
      console.error('Contact.sendContactMessage error:', err);
      return { success: false, error: 'SEND_FAILED' };
    }
  }
};

module.exports = Contact;