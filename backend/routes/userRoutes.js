const express = require('express');
const router = express.Router();
const { createStudent, getStudents } = require('../controllers/userController');
const { protect, isTrainer } = require('../middleware/authMiddleware');

// Applies trainer-only authentication middleware to all routes in this file.
router.use(protect, isTrainer);

// Routes for creating and retrieving student accounts.
router.post('/students', createStudent);
router.get('/students', getStudents);

module.exports = router;