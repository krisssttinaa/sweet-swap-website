const Recipe = require('../models/recipe');

exports.createRecipe = async (req, res) => {
  const { user_id, title, instructions, category } = req.body;
  const image_filename = req.file ? req.file.filename : null;

  try {
    const result = await Recipe.createRecipeWithDefaults({
      user_id,
      title,
      instructions,
      category,
      image_filename
    });

    if (!result.success) {
      if (result.error === 'MISSING_REQUIRED_FIELDS') {
        return res.status(400).json({ error: 'Required fields missing' });
      }
      console.error('createRecipe model error:', result.error);
      return res.status(500).json({ error: 'Could not create recipe' });
    }

    res.status(201).json({ message: 'Recipe created', recipeId: result.recipeId });
  } catch (err) {
    console.error('createRecipe controller error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllRecipes = async (_req, res) => {
  try {
    const rows = await Recipe.getAllRecipes();
    res.json(rows);
  } catch (err) {
    console.error('getAllRecipes controller error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getRecipeById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Recipe.getRecipeWithProducts(id);

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ message: 'Recipe not found' });
      }
      console.error('getRecipeById model error:', result.error);
      return res.status(500).json({ message: 'Could not fetch recipe' });
    }

    res.json(result.recipe);
  } catch (err) {
    console.error('getRecipeById controller error:', err);
    res.status(500).send('Server error');
  }
};

exports.deleteRecipe = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Recipe.deleteRecipeIfExists(id);

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ message: 'Recipe not found' });
      }
      console.error('deleteRecipe model error:', result.error);
      return res.status(500).json({ message: 'Could not delete recipe' });
    }

    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    console.error('deleteRecipe controller error:', err);
    res.status(500).send('Server error');
  }
};

exports.getNewestRecipes = async (_req, res) => {
  try {
    const rows = await Recipe.getLatestRecipes();
    res.json(rows);
  } catch (err) {
    console.error('getNewestRecipes controller error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getRecipesByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    const rows = await Recipe.getRecipesByCategory(category);
    res.json(rows);
  } catch (err) {
    console.error('getRecipesByCategory controller error:', err);
    res.status(500).send('Server error');
  }
};

exports.updateRecipe = async (req, res) => {
  const { id } = req.params;
  const { title, instructions, category } = req.body;
  const image_filename = req.file ? req.file.filename : null;

  try {
    const result = await Recipe.updateRecipeWithMerge(id, {
      title,
      instructions,
      category,
      image_filename
    });

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ message: 'Recipe not found' });
      }
      console.error('updateRecipe model error:', result.error);
      return res.status(500).json({ message: 'Could not update recipe' });
    }

    res.json({ message: 'Recipe updated successfully' });
  } catch (err) {
    console.error('updateRecipe controller error:', err);
    res.status(500).send('Server error');
  }
};

exports.searchRecipes = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const rows = await Recipe.searchRecipes(query);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No recipes found matching your query' });
    }

    res.json(rows);
  } catch (err) {
    console.error('searchRecipes controller error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};