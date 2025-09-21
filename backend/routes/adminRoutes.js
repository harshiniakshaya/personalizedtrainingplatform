const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, updateUser, deleteUser, changeUserPassword } = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Applies admin-only authentication middleware to all routes in this file.
router.use(protect, isAdmin);

// Routes for managing users.
router.route('/users')
    .get(getAllUsers)
    .post(createUser);

// Routes for managing a specific user by their ID.
router.route('/users/:userId')
    .put(updateUser)
    .delete(deleteUser);

// Route for changing a specific user's password.
router.put('/users/:userId/change-password', changeUserPassword);

module.exports = router;