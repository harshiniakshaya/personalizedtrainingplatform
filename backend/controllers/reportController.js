const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');
const User = require('../models/User');

// Generates a progress report for a specific student in a given course.
exports.getStudentProgressReport = async (req, res) => {
    try {
        const { studentId, courseId } = req.params;

        // Verifies that the requester is the course trainer.
        const course = await Course.findById(courseId).populate('quizzes');
        if (!course || course.trainer.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to view this report' });
        }

        const student = await User.findById(studentId).select('name email');
        if (!student) return res.status(404).json({ msg: 'Student not found' });

        // Finds all quiz attempts by the student for this specific course.
        const courseQuizIds = course.quizzes.map(q => q._id);
        const attempts = await QuizAttempt.find({
            student: studentId,
            quiz: { $in: courseQuizIds }
        }).populate('quiz', 'title questions');

        res.json({ student, course, attempts });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};