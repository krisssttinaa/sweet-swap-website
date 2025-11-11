const Recipe = require('../models/recipe');
const db = require('../config/db');
const fs = require('fs');

exports.createRecipe = async (req, res) => {
  const { user_id, title, instructions, category } = req.body;
  const date_created = new Date();
  const image_filename = req.file ? req.file.filename : null;

  if (!user_id || !title || !instructions) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const recipeId = await Recipe.createRecipe({
      title, instructions, user_id, category, date_created, image_filename
    });
    res.status(201).json({ message: 'Recipe created', recipeId });
  } catch (err) {
    console.error('createRecipe error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllRecipes = async (_req, res) => {
  try {
    const rows = await Recipe.getAllRecipes();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getRecipeById = async (req, res) => {
  const { id } = req.params;
  try {
    const [recipe] = await db.query('SELECT * FROM "Recipe" WHERE recipe_id = $1', [id]);
    if (!recipe.length) return res.status(404).json({ message: 'Recipe not found' });

    const [products] = await db.query(
      'SELECT p.*, rp.quantity ' +
      'FROM "RecipeProduct" rp ' +
      'JOIN "Product" p ON rp.product_id = p.product_id ' +
      'WHERE rp.recipe_id = $1',
      [id]
    );

    recipe[0].products = products;
    res.json(recipe[0]);
  } catch (err) {
    console.error('getRecipeById error:', err);
    res.status(500).send('Server error');
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    await Recipe.deleteRecipe(req.params.id);
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getNewestRecipes = async (_req, res) => {
  try {
    const rows = await Recipe.getLatestRecipes();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching newest recipes:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getRecipesByCategory = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM "Recipe" WHERE category = $1', [req.params.category]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.updateRecipe = async (req, res) => {
  const { id } = req.params;
  const { title, instructions, category } = req.body;
  const image_filename = req.file ? req.file.filename : null;

  try {
    const [recipe] = await db.query('SELECT * FROM "Recipe" WHERE recipe_id = $1', [id]);
    if (!recipe.length) return res.status(404).json({ message: 'Recipe not found' });

    await db.query(
      'UPDATE "Recipe" SET title = $1, instructions = $2, category = $3, image_filename = $4 WHERE recipe_id = $5',
      [title || recipe[0].title, instructions || recipe[0].instructions, category || recipe[0].category,
       image_filename || recipe[0].image_filename, id]
    );

    res.json({ message: 'Recipe updated successfully' });
  } catch (err) {
    console.error('Error updating recipe:', err);
    res.status(500).send('Server error');
  }
};