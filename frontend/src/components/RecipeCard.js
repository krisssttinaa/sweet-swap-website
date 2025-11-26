import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RecipeCard.css';
import { API_BASE_URL, FILE_BASE_URL } from '../Configuration';

const RecipeCard = ({ recipe, fetchRecipes }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        const savedResponse = await axios.get(
          `${API_BASE_URL}/saved/saved`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        const savedRecipes = savedResponse.data;
        setIsSaved(
          savedRecipes.some(
            (savedRecipe) => savedRecipe.recipe_id === recipe.recipe_id
          )
        );
      } catch (error) {
        console.error('Error checking saved status', error);
      }
    };

    checkIfSaved();
  }, [recipe.recipe_id]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleEdit = () => {
    navigate(`/edit-recipe/${recipe.recipe_id}`);
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(
        `${API_BASE_URL}/recipes/${recipe.recipe_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (fetchRecipes) {
        fetchRecipes();
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const handleSave = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/saved/save`,
        { recipeId: recipe.recipe_id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setIsSaved(true);
      console.log('Recipe saved');
    } catch (error) {
      console.error('Error saving recipe', error);
    }
  };

  const handleUnsave = async () => {
    try {
      await axios.delete(
        `${API_BASE_URL}/saved/unsave`,
        {
          data: { recipeId: recipe.recipe_id },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setIsSaved(false);
      console.log('Recipe unsaved');
    } catch (error) {
      console.error('Error unsaving recipe', error);
    }
  };

  const handleViewRecipe = () => {
    navigate(`/recipe/${recipe.recipe_id}`);
  };

  const handleReport = () => {
    console.log('Report recipe');
  };

  return (
    <div className="recipe-card" onClick={handleViewRecipe}>
      {recipe.image_filename && (
        <img
          src={`${FILE_BASE_URL}/uploads/${recipe.image_filename}`}
          alt={recipe.title}
          className="recipe-image"
        />
      )}
      <div className="recipe-content">
        <h4>{recipe.title}</h4>
        <p>{recipe.instructions.substring(0, 100)}...</p>
      </div>
      <div className="menu" onClick={toggleMenu}>
        ☰
        {menuOpen && (
          <div className="menu-options">
            {userId && parseInt(userId, 10) === recipe.user_id && (
              <>
                <div onClick={handleEdit}>Edit</div>
                <div onClick={handleDelete}>Delete</div>
              </>
            )}
            {isSaved ? (
              <div onClick={handleUnsave}>Unsave</div>
            ) : (
              <div onClick={handleSave}>Save</div>
            )}
            <div onClick={handleReport}>Report</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;