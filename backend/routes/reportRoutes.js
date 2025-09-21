const express = require('express');
const router = express.Router();
const { getStudentProgressReport } = require('../controllers/reportController');
const { protect, isTrainer } = require('../middleware/authMiddleware');

// Applies trainer-only authentication middleware to all routes in this file.
router.use(protect, isTrainer);

// Gets a detailed progress report for a student in a specific course.
router.get('/student/:studentId/course/:courseId', getStudentProgressReport);

module.exports = router;