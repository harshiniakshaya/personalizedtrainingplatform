const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generates a JSON Web Token for a user.
const generateToken = (user) => {
    const payload = {
        user: {
            id: user.id,
            name: user.name,
            role: user.role
        }
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
};

// Registers a new user.
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User with this email already exists' });
        }

        // Assigns 'trainer' role to the first user, otherwise 'student'.
        const trainerCount = await User.countDocuments({ role: 'trainer' });
        const role = trainerCount === 0 ? 'trainer' : 'student';

        user = new User({ name, email, password, role });
        await user.save();
        
        const token = generateToken(user);
        res.status(201).json({ token });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Authenticates a user and returns a token.
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const token = generateToken(user);
        res.json({ token });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Retrieves the currently authenticated user's data.
exports.getMe = async (req, res) => {
    // User data is populated by the authentication middleware.
    res.json(req.user);
};

// Checks if any user with the 'trainer' role exists.
exports.checkTrainerExists = async (req, res) => {
    try {
        const trainerCount = await User.countDocuments({ role: 'trainer' });
        res.json({ hasTrainer: trainerCount > 0 });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};