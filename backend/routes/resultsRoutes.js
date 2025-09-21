const express = require('express');
const router = express.Router();
const { getMyResults, getResultsForCourse } = require('../controllers/resultsController');
const { protect, isStudent, isTrainer } = require('../middleware/authMiddleware');

// Retrieves all results for the currently authenticated student.
router.get('/my-results', protect, isStudent, getMyResults);

// Retrieves all results for a specific course (trainer only).
router.get('/course/:courseId', protect, isTrainer, getResultsForCourse);

module.exports = router;