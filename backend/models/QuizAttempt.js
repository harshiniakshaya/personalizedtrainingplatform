const mongoose = require('mongoose');

const QuizAttemptSchema = new mongoose.Schema({
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Quiz'
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    answers: [{
        questionId: mongoose.Schema.Types.ObjectId,
        selectedAnswer: String
    }],
    score: {
        type: Number,
        required: true
    }
}, { timestamps: true });

// Ensures that a student can only attempt each quiz a single time.
QuizAttemptSchema.index({ quiz: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);