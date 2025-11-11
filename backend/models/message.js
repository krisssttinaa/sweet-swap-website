const db = require('../config/db');

const Message = {
  async getAllMessages() {
    const [rows] = await db.query('SELECT * FROM "Message"');
    return rows;
  },

  async getMessageById(id) {
    const [rows] = await db.query('SELECT * FROM "Message" WHERE message_id = $1', [id]);
    return rows; // array
  },

  async createMessage({ sender_id, receiver_id, content, date_sent }) {
    const [rows] = await db.query(
      'INSERT INTO "Message" (sender_id, receiver_id, content, date_sent) ' +
      'VALUES ($1, $2, $3, $4) RETURNING message_id',
      [sender_id, receiver_id, content, date_sent]
    );
    return rows[0].message_id;
  },

  async deleteMessage(id) {
    await db.query('DELETE FROM "Message" WHERE message_id = $1', [id]);
    return true;
  }
};

module.exports = Message;