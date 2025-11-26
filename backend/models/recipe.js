const db = require('../config/db');

const Recipe = {
  // --- Low-level DAO methods ---

  async getAllRecipes() {
    const [rows] = await db.query('SELECT * FROM "Recipe"');
    return rows;
  },

  async getRecipeById(id) {
    const [rows] = await db.query(
      'SELECT * FROM "Recipe" WHERE recipe_id = $1',
      [id]
    );
    return rows; // array
  },

  async createRecipeRaw({ title, instructions, user_id, category, date_created, image_filename }) {
    const [rows] = await db.query(
      'INSERT INTO "Recipe" (title, instructions, user_id, category, date_created, image_filename) ' +
      'VALUES ($1, $2, $3, $4, $5, $6) RETURNING recipe_id',
      [title, instructions, user_id, category, date_created, image_filename]
    );
    return rows[0].recipe_id;
  },

  async updateRecipeRaw(id, { title, instructions, category, image_filename }) {
    await db.query(
      'UPDATE "Recipe" SET title = $1, instructions = $2, category = $3, image_filename = $4 ' +
      'WHERE recipe_id = $5',
      [title, instructions, category, image_filename, id]
    );
    return true;
  },

  async deleteRecipeRaw(id) {
    await db.query('DELETE FROM "Recipe" WHERE recipe_id = $1', [id]);
    return true;
  },

  async getLatestRecipes() {
    const [rows] = await db.query(
      'SELECT * FROM "Recipe" ORDER BY date_created DESC LIMIT 3'
    );
    return rows;
  },

  async getRecipesByCategory(category) {
    const [rows] = await db.query(
      'SELECT * FROM "Recipe" WHERE category = $1',
      [category]
    );
    return rows;
  },

  // --- Business logic methods used by controllers ---
  async createRecipeWithDefaults({ user_id, title, instructions, category, image_filename }) {
    if (!user_id || !title || !instructions) {
      return { success: false, error: 'MISSING_REQUIRED_FIELDS' };
    }

    const date_created = new Date();

    const recipeId = await this.createRecipeRaw({
      title,
      instructions,
      user_id,
      category: category || null,
      date_created,
      image_filename: image_filename || null
    });

    return { success: true, recipeId };
  },

  async getRecipeWithProducts(id) {
    const rows = await this.getRecipeById(id);
    if (!rows.length) {
      return { success: false, error: 'NOT_FOUND' };
    }

    const recipe = rows[0];

    const [products] = await db.query(
      'SELECT p.*, rp.quantity ' +
      'FROM "RecipeProduct" rp ' +
      'JOIN "Product" p ON rp.product_id = p.product_id ' +
      'WHERE rp.recipe_id = $1',
      [id]
    );

    recipe.products = products;
    return { success: true, recipe };
  },

  async deleteRecipeIfExists(id) {
    const rows = await this.getRecipeById(id);
    if (!rows.length) {
      return { success: false, error: 'NOT_FOUND' };
    }

    await this.deleteRecipeRaw(id);
    return { success: true };
  },

  async updateRecipeWithMerge(id, { title, instructions, category, image_filename }) {
    const rows = await this.getRecipeById(id);
    if (!rows.length) {
      return { success: false, error: 'NOT_FOUND' };
    }

    const base = rows[0];

    const merged = {
      title: title || base.title,
      instructions: instructions || base.instructions,
      category: category || base.category,
      image_filename: image_filename || base.image_filename
    };

    await this.updateRecipeRaw(id, merged);
    return { success: true };
  },
  
  async searchRecipes(query) {
    const like = `%${query}%`;
    const [rows] = await db.query(
      'SELECT * FROM "Recipe" WHERE title ILIKE $1 OR instructions ILIKE $1',
      [like]
    );
    return rows;
  },
};

module.exports = Recipe;