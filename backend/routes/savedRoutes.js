const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const savedRecipeController = require('../controllers/savedRecipeController');

router.post('/save', auth, savedRecipeController.saveRecipe);
router.delete('/unsave', auth, savedRecipeController.unsaveRecipe);
router.get('/saved', auth, savedRecipeController.getSavedRecipes);

module.exports = router;