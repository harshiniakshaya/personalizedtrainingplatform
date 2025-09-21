const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, checkTrainerExists } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Handles user registration.
router.post('/register', registerUser);

// Handles user authentication and token generation.
router.post('/login', loginUser);

// Retrieves the profile of the currently authenticated user.
router.get('/me', protect, getMe);

// Checks if a user with the 'trainer' role exists in the system.
router.get('/check-trainer', checkTrainerExists);

module.exports = router;