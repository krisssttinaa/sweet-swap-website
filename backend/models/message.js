const db = require('../config/db');

const Message = {
  // --- Low-level DAO methods ---

  async getAllMessages() {
    const [rows] = await db.query('SELECT * FROM "Message"');
    return rows;
  },

  async getMessageById(id) {
    const [rows] = await db.query(
      'SELECT * FROM "Message" WHERE message_id = $1',
      [id]
    );
    return rows; // array
  },

  async createMessageRaw({ sender_id, receiver_id, content, date_sent }) {
    const [rows] = await db.query(
      'INSERT INTO "Message" (sender_id, receiver_id, content, date_sent) ' +
      'VALUES ($1, $2, $3, $4) RETURNING message_id',
      [sender_id, receiver_id, content, date_sent]
    );
    return rows[0].message_id;
  },

  async deleteMessageRaw(id) {
    await db.query(
      'DELETE FROM "Message" WHERE message_id = $1',
      [id]
    );
    return true;
  },

  // --- Business logic methods used by controllers ---
  async getMessageDetails(id) {
    const rows = await this.getMessageById(id);
    if (!rows.length) {
      return { success: false, error: 'NOT_FOUND' };
    }
    return { success: true, message: rows[0] };
  },

  async createMessageWithDefaults({ sender_id, receiver_id, content }) {
    if (!sender_id || !receiver_id || !content) {
      return { success: false, error: 'INVALID_INPUT' };
    }

    const date_sent = new Date();

    const message_id = await this.createMessageRaw({
      sender_id,
      receiver_id,
      content,
      date_sent
    });

    return { success: true, message_id };
  },

  async deleteMessageIfExists(id) {
    const rows = await this.getMessageById(id);
    if (!rows.length) {
      return { success: false, error: 'NOT_FOUND' };
    }

    await this.deleteMessageRaw(id);
    return { success: true };
  }
};

module.exports = Message;