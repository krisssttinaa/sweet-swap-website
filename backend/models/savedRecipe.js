const db = require('../config/db');

const SavedRecipe = {
  async create(userId, recipeId) {
    await db.query('INSERT INTO "SavedRecipes" (user_id, recipe_id) VALUES ($1, $2)', [userId, recipeId]);
    return true;
  },
  async delete(userId, recipeId) {
    await db.query('DELETE FROM "SavedRecipes" WHERE user_id = $1 AND recipe_id = $2', [userId, recipeId]);
    return true;
  },
  async findByUser(userId) {
    const [rows] = await db.query(
      'SELECT r.* FROM "SavedRecipes" sr JOIN "Recipe" r ON sr.recipe_id = r.recipe_id WHERE sr.user_id = $1',
      [userId]
    );
    return rows;
  },
  async findAll() {
    const [rows] = await db.query('SELECT * FROM "SavedRecipes"');
    return rows;
  }
};

module.exports = SavedRecipe;