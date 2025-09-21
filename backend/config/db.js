const mongoose = require('mongoose');

// This function intelligently connects to the correct database.
const connectDB = async () => {
  try {
    // It prioritizes the test database URI if it exists (set by Jest's global setup).
    // Otherwise, it falls back to your development URI from the .env file.
    const dbUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;

    if (!dbUri) {
      throw new Error('MongoDB URI not found. Please set MONGO_URI or MONGO_URI_TEST in your environment.');
    }

    const conn = await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;


