const express = require('express');
const router = express.Router();
const { 
    createCourse, 
    getCourses, 
    getCourseById,
    updateCourse,
    deleteCourse
} = require('../controllers/courseController');
const { protect, isTrainer } = require('../middleware/authMiddleware');

// Creates a new course.
router.post('/', protect, isTrainer, createCourse);

// Gets all courses relevant to the user.
router.get('/', protect, getCourses);

// Gets a single course by ID.
router.get('/:id', protect, getCourseById);

// Updates a course.
router.put('/:id', protect, isTrainer, updateCourse);

// Deletes a course.
router.delete('/:id', protect, isTrainer, deleteCourse);

module.exports = router;