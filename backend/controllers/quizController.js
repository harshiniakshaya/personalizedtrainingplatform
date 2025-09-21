const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const QuizAttempt = require('../models/QuizAttempt');

// Creates a new quiz and associates it with a course.
exports.createQuiz = async (req, res) => {
    const { title, questions, courseId } = req.body;
    try {
        const course = await Course.findById(courseId);
        if (!course || course.trainer.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to add a quiz to this course' });
        }
        const newQuiz = new Quiz({ title, questions, course: courseId });
        const quiz = await newQuiz.save();
        course.quizzes.push(quiz._id);
        await course.save();
        res.status(201).json(quiz);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Retrieves a complete quiz by its ID for the course trainer.
exports.getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);
        // Ensures the user is the trainer of the course.
        const course = await Course.findById(quiz.course);
        if (course.trainer.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to view this quiz' });
        }
        if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });
        res.json(quiz);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Updates a quiz's title and questions.
exports.updateQuiz = async (req, res) => {
    const { title, questions } = req.body;
    try {
        let quiz = await Quiz.findById(req.params.quizId);
        if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

        const course = await Course.findById(quiz.course);
        if (course.trainer.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to update this quiz' });
        }

        quiz.title = title;
        quiz.questions = questions;
        await quiz.save();
        res.json(quiz);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Deletes a quiz and all associated attempts.
exports.deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);
        if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

        const course = await Course.findById(quiz.course);
        if (course.trainer.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to delete this quiz' });
        }
        
        // Remove quiz reference from the parent course.
        course.quizzes.pull(quiz._id);
        await course.save();

        // Delete the quiz and its attempts.
        await QuizAttempt.deleteMany({ quiz: quiz._id });
        await quiz.deleteOne();

        res.json({ msg: 'Quiz removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Fetches a quiz for a student, omitting the correct answers.
exports.getQuizForStudent = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId).select('-questions.correctAnswer');
        if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });
        res.json(quiz);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Submits a student's answers for a quiz and calculates the score.
exports.submitQuiz = async (req, res) => {
    const { answers } = req.body;
    const { quizId } = req.params;
    try {
        if (await QuizAttempt.findOne({ quiz: quizId, student: req.user.id })) {
            return res.status(400).json({ msg: 'You have already submitted this quiz' });
        }
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

        let score = 0;
        quiz.questions.forEach(q => {
            const studentAnswer = answers.find(a => a.questionId === q._id.toString());
            if (studentAnswer && studentAnswer.selectedAnswer === q.correctAnswer) {
                score++;
            }
        });

        await QuizAttempt.create({ quiz: quizId, student: req.user.id, answers, score });
        
        res.status(201).json({ score, totalQuestions: quiz.questions.length });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Retrieves all student attempts for a specific quiz.
exports.getQuizResults = async (req, res) => {
    try {
        const { quizId } = req.params;
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

        const course = await Course.findById(quiz.course);
        if (course.trainer.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to view these results' });
        }
        const results = await QuizAttempt.find({ quiz: quizId }).populate('student', 'name email');
        res.json(results);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Retrieves all quiz attempts for the currently logged-in student.
exports.getMyResults = async (req, res) => {
    try {
        const results = await QuizAttempt.find({ student: req.user.id })
            .populate({
                path: 'quiz',
                select: 'title questions'
            })
            .sort({ createdAt: -1 });
        res.json(results);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};