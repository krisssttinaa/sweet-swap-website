const SavedRecipe = require('../models/savedRecipe');

exports.saveRecipe = async (req, res) => {
  const { recipeId } = req.body;
  const userId = req.user.id;

  try {
    await SavedRecipe.create(userId, recipeId);
    res.status(200).send('Recipe saved successfully');
  } catch (error) {
    console.error('saveRecipe controller error:', error);
    res.status(500).send('Error saving recipe');
  }
};

exports.unsaveRecipe = async (req, res) => {
  const { recipeId } = req.body;
  const userId = req.user.id;

  try {
    await SavedRecipe.delete(userId, recipeId);
    res.status(200).send('Recipe unsaved successfully');
  } catch (error) {
    console.error('unsaveRecipe controller error:', error);
    res.status(500).send('Error unsaving recipe');
  }
};

exports.getSavedRecipes = async (req, res) => {
  const userId = req.user.id;

  try {
    const savedRecipes = await SavedRecipe.findByUser(userId);
    res.status(200).json(savedRecipes);
  } catch (error) {
    console.error('getSavedRecipes controller error:', error);
    res.status(500).send('Error fetching saved recipes');
  }
};