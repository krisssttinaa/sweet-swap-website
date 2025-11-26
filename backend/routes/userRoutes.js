const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', auth, userController.profile);
router.put('/profile', auth, userController.updateProfile);
router.get('/all', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.delete('/profile', auth, userController.deleteProfile);
router.put('/profile-picture', auth, userController.updateProfilePicture);

module.exports = router;