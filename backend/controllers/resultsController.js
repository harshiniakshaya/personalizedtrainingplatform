const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');

// Retrieves all quiz results for the currently authenticated student.
exports.getMyResults = async (req, res) => {
    try {
        const results = await QuizAttempt.find({ student: req.user.id })
            .populate('quiz', 'title');
        
        if (!results) {
            return res.json([]);
        }
        
        res.json(results);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Retrieves all quiz results for a specific course (trainer access only).
exports.getResultsForCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }
        // Verifies the requester is the course trainer.
        if (course.trainer.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Finds all attempts for quizzes that are in this course's quiz list.
        const results = await QuizAttempt.find({ quiz: { $in: course.quizzes } })
            .populate('student', 'name email')
            .populate('quiz', 'title');
            
        res.json(results);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};