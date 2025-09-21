const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies a JWT from the header and attaches the user to the request.
const protect = async (req, res, next) => {
    let token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.user.id).select('-password');
        next();
    } catch (e) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Checks if the authenticated user has a 'trainer' role.
const isTrainer = (req, res, next) => {
    if (req.user && req.user.role === 'trainer') {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied. Not authorized as a trainer.' });
    }
};

// Checks if the authenticated user has a 'student' role.
const isStudent = (req, res, next) => {
    if (req.user && req.user.role === 'student') {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied. Not authorized as a student.' });
    }
};

// Checks if the authenticated user has an 'admin' role.
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied. Not authorized as an admin.' });
    }
};

module.exports = { protect, isTrainer, isStudent, isAdmin };