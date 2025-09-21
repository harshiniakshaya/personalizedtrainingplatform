const User = require('../models/User');

// Fetches all users who are not admins.
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Creates a new user in the database.
exports.createUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        if (await User.findOne({ email })) {
            return res.status(400).json({ msg: 'User with this email already exists' });
        }
        const user = new User({ name, email, password, role });
        await user.save();
        res.status(201).json({_id: user._id, name: user.name, email: user.email, role: user.role });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Updates a specific user's information by their ID.
exports.updateUser = async (req, res) => {
    const { name, email, role } = req.body;
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;

        await user.save();
        res.json({_id: user._id, name: user.name, email: user.email, role: user.role });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Deletes a specific user by their ID.
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        await user.deleteOne();
        res.json({ msg: 'User removed successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Changes the password for a specific user.
exports.changeUserPassword = async (req, res) => {
    const { password } = req.body;
    try {
        if (!password || password.length < 6) {
            return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
        }

        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.password = password;
        await user.save();
        
        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};