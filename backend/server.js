const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env file.
dotenv.config();

// Establish the database connection.
connectDB();

// Initialize the Express application.
const app = express();

// Apply core middleware.
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies.

// Define API routes.
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Define the application port.
const PORT = process.env.PORT || 5001;

// Start the server only when the script is executed directly.
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

// Export the app for potential use in testing environments.
module.exports = app;
