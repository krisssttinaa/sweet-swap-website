const db = require('../config/db');

const Comment = {
  async getAllComments() {
    const [rows] = await db.query('SELECT * FROM "Comment"');
    return rows;
  },

  async getCommentById(id) {
    const [rows] = await db.query('SELECT * FROM "Comment" WHERE comment_id = $1', [id]);
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

  async createComment({ recipe_id, user_id, content, date_commented }) {
    const [rows] = await db.query(
      'INSERT INTO "Comment" (recipe_id, user_id, content, date_commented) ' +
      'VALUES ($1, $2, $3, $4) RETURNING comment_id',
      [recipe_id, user_id, content, date_commented]
    );
    return rows[0].comment_id;
  },

  async updateComment(id, content) {
    await db.query('UPDATE "Comment" SET content = $1 WHERE comment_id = $2', [content, id]);
    return true;
  },

  async deleteComment(comment_id) {
    await db.query('DELETE FROM "Comment" WHERE comment_id = $1', [comment_id]);
    return true;
  }
};

module.exports = Comment;