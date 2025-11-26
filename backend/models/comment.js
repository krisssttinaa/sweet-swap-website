const db = require('../config/db');

const Comment = {
  // --- Low-level DAO methods ---

  async getAllComments() {
    const [rows] = await db.query('SELECT * FROM "Comment"');
    return rows;
  },

  async getCommentById(id) {
    const [rows] = await db.query(
      'SELECT * FROM "Comment" WHERE comment_id = $1',
      [id]
    );
    return rows; // array
  },

  async getCommentsByRecipeId(recipe_id) {
    const [rows] = await db.query(
      'SELECT c.*, u."username" ' +
      'FROM "Comment" c JOIN "User" u ON c.user_id = u.user_id ' +
      'WHERE c.recipe_id = $1 ORDER BY c.date_commented ASC',
      [recipe_id]
    );
    return rows;
  },

  async createCommentRaw({ recipe_id, user_id, content, date_commented }) {
    const [rows] = await db.query(
      'INSERT INTO "Comment" (recipe_id, user_id, content, date_commented) ' +
      'VALUES ($1, $2, $3, $4) RETURNING comment_id',
      [recipe_id, user_id, content, date_commented]
    );
    return rows[0].comment_id;
  },

  async updateCommentRaw(id, content) {
    await db.query(
      'UPDATE "Comment" SET content = $1 WHERE comment_id = $2',
      [content, id]
    );
    return true;
  },

  async deleteCommentRaw(comment_id) {
    await db.query(
      'DELETE FROM "Comment" WHERE comment_id = $1',
      [comment_id]
    );
    return true;
  },

  // --- Business logic methods used by controllers ---
  async getCommentDetails(id) {
    const rows = await this.getCommentById(id);
    if (!rows.length) {
      return { success: false, error: 'NOT_FOUND' };
    }
    return { success: true, comment: rows[0] };
  },
  async getCommentsForRecipe(recipe_id) {
    const rows = await this.getCommentsByRecipeId(recipe_id);
    return { success: true, comments: rows };
  },

  async createCommentWithDefaults({ recipe_id, user_id, content }) {
    if (!recipe_id || !user_id || !content) {
      return { success: false, error: 'INVALID_INPUT' };
    }

    const date_commented = new Date();

    const comment_id = await this.createCommentRaw({
      recipe_id,
      user_id,
      content,
      date_commented
    });

    return { success: true, comment_id };
  },

  async updateCommentIfExists(id, content) {
    if (!content) {
      return { success: false, error: 'INVALID_INPUT' };
    }

    const rows = await this.getCommentById(id);
    if (!rows.length) {
      return { success: false, error: 'NOT_FOUND' };
    }

    await this.updateCommentRaw(id, content);
    return { success: true };
  },

  async deleteCommentIfExists(comment_id) {
    const rows = await this.getCommentById(comment_id);
    if (!rows.length) {
      return { success: false, error: 'NOT_FOUND' };
    }

    await this.deleteCommentRaw(comment_id);
    return { success: true };
  }
};

module.exports = Comment;