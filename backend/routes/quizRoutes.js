const express = require('express');
const router = express.Router();
const {
    createQuiz,
    getQuizForStudent,
    submitQuiz,
    getQuizResults,
    getMyResults,
    getQuizById,
    updateQuiz,
    deleteQuiz
} = require('../controllers/quizController');
const { protect, isTrainer, isStudent } = require('../middleware/authMiddleware');

// Allows a trainer to create a new quiz.
router.post('/', protect, isTrainer, createQuiz);

// Gets all quiz results for the logged-in student.
router.get('/my-results', protect, isStudent, getMyResults);

// Routes for a trainer to get, update, or delete a specific quiz.
router.route('/:quizId')
    .get(protect, isTrainer, getQuizById)
    .put(protect, isTrainer, updateQuiz)
    .delete(protect, isTrainer, deleteQuiz);
    
// Allows a student to retrieve a quiz for an attempt.
router.get('/:quizId/take', protect, isStudent, getQuizForStudent);

// Allows a student to submit their quiz answers.
router.post('/:quizId/submit', protect, isStudent, submitQuiz);

// Allows a trainer to view all results for a specific quiz.
router.get('/:quizId/results', protect, isTrainer, getQuizResults);

module.exports = router;