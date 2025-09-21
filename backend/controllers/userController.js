const User = require('../models/User');

// Creates a new user with the 'student' role.
exports.createStudent = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const studentExists = await User.findOne({ email });
        if (studentExists) {
            return res.status(400).json({ msg: 'Student with this email already exists' });
        }
        const student = new User({
            name,
            email,
            password,
            role: 'student'
        });
        await student.save();
        const studentData = { ...student._doc };
        delete studentData.password;
        res.status(201).json(studentData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Retrieves all users with the 'student' role.
exports.getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        res.json(students);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};