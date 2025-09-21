const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

// Imports a default admin user into the database.
const importData = async () => {
    try {
        // Clears any previous admin with the same email.
        await User.deleteMany({ email: 'admin@learnix.com' });

        await User.create({
            name: 'Admin User',
            email: 'admin@learnix.com',
            password: 'admin', // Note: Use a strong, hashed password in production.
            role: 'admin'
        });

        console.log('Admin user created successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

// Removes all admin users from the database.
const destroyData = async () => {
    try {
        await User.deleteMany({ role: 'admin' });
        console.log('Admin users destroyed!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

// Determines which function to run based on command-line arguments.
if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}