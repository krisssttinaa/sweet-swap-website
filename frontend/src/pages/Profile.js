import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';
import { API_BASE_URL, FILE_BASE_URL } from '../Configuration';

const Profile = () => {
  const { id } = useParams(); // optional :id in route
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPicture, setSelectedPicture] = useState('default.png');
  const [isPictureModalOpen, setIsPictureModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    surname: '',
    email: '',
    password: '',
    dietaryGoals: '',
  });

  const loggedInUserId = localStorage.getItem('user_id') || null;
  const token = localStorage.getItem('token');

  const isCurrentUser =
    !id || (user && String(user.user_id) === String(loggedInUserId));

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const userIdToFetch = id || loggedInUserId;
        if (!userIdToFetch) {
          navigate('/login');
          return;
        }

        const { data } = await axios.get(
          `${API_BASE_URL}/users/${userIdToFetch}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUser(data);
        setSelectedPicture(data.profile_picture || 'default.png');

        if (!id) {
          setFormData({
            username: data.username,
            name: data.name,
            surname: data.surname,
            email: data.email,
            password: '********',
            dietaryGoals: data.dietary_goals || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        navigate('/login');
      }
    };

    fetchProfile();
  }, [id, loggedInUserId, token, navigate]);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!user) return;
      try {
        const { data } = await axios.get(`${API_BASE_URL}/recipes`);
        setRecipes(
          data.filter((r) => String(r.user_id) === String(user.user_id))
        );
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };
    fetchRecipes();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePictureSelect = (picture) => setSelectedPicture(picture);

  const handleEditClick = () => {
    if (!isCurrentUser) return;
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    const updateData = {
      username: formData.username,
      name: formData.name,
      surname: formData.surname,
      email: formData.email,
      dietaryGoals: formData.dietaryGoals,
      profilePicture: selectedPicture,
    };

    if (formData.password && formData.password !== '********') {
      updateData.password = formData.password;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/users/profile`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser((prev) => ({
        ...prev,
        ...updateData,
        dietary_goals: updateData.dietaryGoals,
        profile_picture: updateData.profilePicture,
        password: prev.password,
      }));

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancelClick = () => {
    setFormData({
      username: user.username,
      name: user.name,
      surname: user.surname,
      email: user.email,
      password: '********',
      dietaryGoals: user.dietary_goals || '',
    });
    setSelectedPicture(user.profile_picture || 'default.png');
    setIsEditing(false);
  };

  const handleDeleteClick = async () => {
    try {
      await axios.delete(
        `${API_BASE_URL}/users/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.clear();
      navigate('/login');
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  const openPictureModal = () => setIsPictureModalOpen(true);
  const closePictureModal = () => setIsPictureModalOpen(false);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-page">
      <h2>{isCurrentUser ? 'Profile' : `${user.username}'s Profile`}</h2>

      {isCurrentUser && isEditing ? (
        <div className="edit-form">
          <label>Username:</label>
          <input name="username" value={formData.username} onChange={handleInputChange} />

          <label>Name:</label>
          <input name="name" value={formData.name} onChange={handleInputChange} />

          <label>Surname:</label>
          <input name="surname" value={formData.surname} onChange={handleInputChange} />

          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} />

          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter new password or leave blank"
          />

          <label>Dietary Goals:</label>
          <textarea
            name="dietaryGoals"
            value={formData.dietaryGoals}
            onChange={handleInputChange}
            rows="3"
            placeholder="Enter your dietary goals"
            className="textarea-dietary-goals"
          />

          <label>Select Profile Picture:</label>
          <img
            src={`${FILE_BASE_URL}/uploads/${selectedPicture}`}
            alt="Profile"
            className="profile-picture"
            onClick={openPictureModal}
          />

          <div className="button-group">
            <div className="button-grouppp">
              <button className="save" onClick={handleSaveClick}>Save</button>
              <button className="cancel" onClick={handleCancelClick}>Cancel</button>
            </div>
            <button className="delete" onClick={handleDeleteClick}>Delete Account</button>
          </div>
        </div>
      ) : (
        <div className="profile-info">
          <img
            src={`${FILE_BASE_URL}/uploads/${user.profile_picture || 'default.png'}`}
            alt="Profile"
            className="profile-pic"
          />
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Surname:</strong> {user.surname}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Dietary Goals:</strong> {user.dietary_goals || 'Not specified'}</p>
          {isCurrentUser && (
            <button className="edit" onClick={handleEditClick}>Edit</button>
          )}
        </div>
      )}

      <h3>{isCurrentUser ? 'My Recipes' : `${user.username}'s Recipes`}</h3>
      <div className="recipe-list">
        {recipes.length === 0 ? (
          <p>No recipes found.</p>
        ) : (
          recipes.map((recipe) => (
            <div
              key={recipe.recipe_id}
              className="recipe-item"
              onClick={() => navigate(`/recipe/${recipe.recipe_id}`)}
            >
              {recipe.image_filename && (
                <img
                  src={`${FILE_BASE_URL}/uploads/${recipe.image_filename}`}
                  alt={recipe.title}
                  className="recipe-image"
                />
              )}
              <div className="recipe-content">
                <h4>{recipe.title}</h4>
                <p>{(recipe.instructions || '').substring(0, 100)}...</p>
              </div>
            </div>
          ))
        )}
      </div>

      {isPictureModalOpen && (
        <div className="picture-modal">
          <div className="picture-grid">
            {[
              'default.png','profile0.png','profile1.png','profile2.png','profile3.png',
              'profile4.png','profile5.png','profile6.png','profile7.png','profile8.png',
              'profile9.png','profile10.png','profile11.png','profile12.png','profile13.png','profile14.png'
            ].map((pic) => (
              <img
                key={pic}
                src={`${FILE_BASE_URL}/uploads/${pic}`}
                alt="Profile Option"
                className={`picture-option ${selectedPicture === pic ? 'selected' : ''}`}
                onClick={() => handlePictureSelect(pic)}
              />
            ))}
          </div>
          <div className="modal-actions">
            <button onClick={closePictureModal} className="close">Close</button>
            <button onClick={closePictureModal} className="save">Save Selection</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;