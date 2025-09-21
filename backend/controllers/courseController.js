const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// Creates a new course.
exports.createCourse = async (req, res) => {
    const { title, description } = req.body;
    try {
        const newCourse = new Course({ title, description, trainer: req.user.id });
        const course = await newCourse.save();
        res.status(201).json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Retrieves courses relevant to the logged-in user.
exports.getCourses = async (req, res) => {
    try {
        let courses;
        // Defines fields to populate with detailed information.
        const population = [
            { path: 'trainer', select: 'name' },
            { path: 'students', select: 'name email' },
            { path: 'quizzes' } 
        ];

        if (req.user.role === 'trainer') {
            courses = await Course.find({ trainer: req.user.id }).populate(population);
        } else {
            courses = await Course.find({ students: req.user.id }).populate(population);
        }
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Fetches a single course by its ID.
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('trainer', 'name')
            .populate('students', 'name email')
            .populate('quizzes'); 

        if (!course) return res.status(404).json({ msg: 'Course not found' });
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Updates a course's title, description, and student enrollment.
exports.updateCourse = async (req, res) => {
    const { title, description, students } = req.body;
    try {
        let course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });
        if (course.trainer.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        course.title = title;
        course.description = description;
        course.students = students;
        await course.save();

        const updatedCourse = await Course.findById(course._id).populate(['trainer', 'students', 'quizzes']);
        res.json(updatedCourse);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Deletes a course and its associated quizzes and attempts.
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });
        if (course.trainer.toString() !== req.user.id) return res.status(401).json({ msg: 'User not authorized' });

        await Quiz.deleteMany({ course: course._id });
        await QuizAttempt.deleteMany({ quiz: { $in: course.quizzes } });
        await course.deleteOne();

        res.json({ msg: 'Course and associated data removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};