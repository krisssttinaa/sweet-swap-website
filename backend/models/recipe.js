const db = require('../config/db');

const Recipe = {
  async getAllRecipes() {
    const [rows] = await db.query('SELECT * FROM "Recipe"');
    return rows;
  },

  async getRecipeById(id) {
    const [rows] = await db.query('SELECT * FROM "Recipe" WHERE recipe_id = $1', [id]);
    return rows; // array
  },

  async createRecipe({ title, instructions, user_id, category, date_created, image_filename }) {
    const [rows] = await db.query(
      'INSERT INTO "Recipe" (title, instructions, user_id, category, date_created, image_filename) ' +
      'VALUES ($1, $2, $3, $4, $5, $6) RETURNING recipe_id',
      [title, instructions, user_id, category, date_created, image_filename]
    );
    return rows[0].recipe_id;
  },

  async updateRecipe(id, { title, instructions, category, image_filename }) {
    await db.query(
      'UPDATE "Recipe" SET title = $1, instructions = $2, category = $3, image_filename = $4 WHERE recipe_id = $5',
      [title, instructions, category, image_filename, id]
    );
    return true;
  },

  async deleteRecipe(id) {
    await db.query('DELETE FROM "Recipe" WHERE recipe_id = $1', [id]);
    return true;
  },

  async getLatestRecipes() {
    const [rows] = await db.query('SELECT * FROM "Recipe" ORDER BY date_created DESC LIMIT 3');
    return rows;
  }
};

module.exports = Recipe;