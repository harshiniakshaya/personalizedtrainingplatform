const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

let trainerToken;
let studentToken;
let courseId;
let quizId;

describe('Quiz API Endpoints', () => {

  // Before all tests in this suite, set up the necessary users and a course.
  beforeAll(async () => {
    // 1. Create Trainer and get token
    await request(app).post('/api/auth/register').send({ name: 'Test Trainer', email: 'trainer@test.com', password: 'password123' });
    const trainerLoginRes = await request(app).post('/api/auth/login').send({ email: 'trainer@test.com', password: 'password123' });
    trainerToken = trainerLoginRes.body.token;

    // 2. Create Student and get token
    await request(app).post('/api/auth/register').send({ name: 'Test Student', email: 'student@test.com', password: 'password123' });
    const studentLoginRes = await request(app).post('/api/auth/login').send({ email: 'student@test.com', password: 'password123' });
    studentToken = studentLoginRes.body.token;

    // 3. Create a course as the trainer
    const trainer = await User.findOne({ email: 'trainer@test.com' });
    const course = await Course.create({ title: 'Test Course', description: 'A course for testing', trainer: trainer._id });
    courseId = course._id;
  });
  
  // After each test, clean up the Quiz and QuizAttempt collections to ensure isolation.
  afterEach(async () => {
      await Quiz.deleteMany({});
      await QuizAttempt.deleteMany({});
  });

  // After all tests, clean up the major collections.
  afterAll(async () => {
      await User.deleteMany({});
      await Course.deleteMany({});
      await mongoose.connection.close(); // Close the connection
  });


  it('should allow a trainer to create a new quiz', async () => {
    const quizData = {
      title: 'Math Basics Quiz',
      courseId: courseId,
      questions: [{
        questionText: 'What is 2 + 2?',
        options: ['3', '4', '5'],
        correctAnswer: '4'
      }]
    };

    const res = await request(app)
      .post('/api/quizzes')
      .set('x-auth-token', trainerToken)
      .send(quizData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe('Math Basics Quiz');
  });
  
  it('should forbid a student from creating a quiz', async () => {
    const res = await request(app)
      .post('/api/quizzes')
      .set('x-auth-token', studentToken)
      .send({ title: 'Failed Quiz', courseId: courseId, questions: [] });
    expect(res.statusCode).toEqual(403);
  });

  describe('when a quiz exists', () => {
    let existingQuizId;
    let questionId;

    // Create a quiz before each test in this nested block.
    beforeEach(async () => {
        const quiz = await Quiz.create({
            title: 'Persistent Quiz',
            course: courseId,
            questions: [{ questionText: 'Is the sky blue?', options: ['Yes', 'No'], correctAnswer: 'Yes'}]
        });
        existingQuizId = quiz._id;
        questionId = quiz.questions[0]._id;
        
        // Also add the quiz to the course's quiz array
        await Course.findByIdAndUpdate(courseId, { $push: { quizzes: existingQuizId } });
    });

    it('should allow a student to fetch the quiz for taking (without answers)', async () => {
        const res = await request(app)
            .get(`/api/quizzes/${existingQuizId}/take`)
            .set('x-auth-token', studentToken);

        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toBe('Persistent Quiz');
        expect(res.body.questions[0].correctAnswer).toBeUndefined();
    });

    it('should allow a student to submit the quiz and get a score', async () => {
        const submission = { answers: [{ questionId: questionId.toString(), selectedAnswer: 'Yes' }] };

        const res = await request(app)
            .post(`/api/quizzes/${existingQuizId}/submit`)
            .set('x-auth-token', studentToken)
            .send(submission);

        expect(res.statusCode).toEqual(201);
        expect(res.body.score).toBe(1);
    });

    it('should NOT allow a student to submit a quiz twice', async () => {
        // First submission
        await request(app).post(`/api/quizzes/${existingQuizId}/submit`).set('x-auth-token', studentToken).send({ answers: [{ questionId: questionId.toString(), selectedAnswer: 'Yes' }] });

        // Second submission
        const res = await request(app).post(`/api/quizzes/${existingQuizId}/submit`).set('x-auth-token', studentToken).send({ answers: [] });
        
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe('You have already submitted this quiz');
    });

    it('should allow a trainer to view all results for the quiz', async () => {
        await request(app).post(`/api/quizzes/${existingQuizId}/submit`).set('x-auth-token', studentToken).send({ answers: [{ questionId: questionId.toString(), selectedAnswer: 'Yes' }] });
        
        const res = await request(app)
            .get(`/api/quizzes/${existingQuizId}/results`)
            .set('x-auth-token', trainerToken);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].student.name).toBe('Test Student');
    });

    // NEW TESTS for trainer CRUD operations
    it('should allow a trainer to get a quiz by its ID', async () => {
        const res = await request(app)
            .get(`/api/quizzes/${existingQuizId}`)
            .set('x-auth-token', trainerToken);

        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toBe('Persistent Quiz');
        expect(res.body.questions[0].correctAnswer).toBe('Yes'); // Trainer can see answers
    });
    
    it('should allow a trainer to update a quiz', async () => {
        const updatedData = {
            title: 'Updated Quiz Title',
            questions: [{ questionText: 'Is grass green?', options: ['Yes', 'No'], correctAnswer: 'Yes' }]
        };

        const res = await request(app)
            .put(`/api/quizzes/${existingQuizId}`)
            .set('x-auth-token', trainerToken)
            .send(updatedData);

        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toBe('Updated Quiz Title');
        expect(res.body.questions[0].questionText).toBe('Is grass green?');
    });

    it('should allow a trainer to delete a quiz and its attempts', async () => {
        // A student first makes an attempt
        await request(app).post(`/api/quizzes/${existingQuizId}/submit`).set('x-auth-token', studentToken).send({ answers: [] });

        const res = await request(app)
            .delete(`/api/quizzes/${existingQuizId}`)
            .set('x-auth-token', trainerToken);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.msg).toBe('Quiz removed');

        // Verify the quiz and its attempt are gone
        const quiz = await Quiz.findById(existingQuizId);
        const attempt = await QuizAttempt.findOne({ quiz: existingQuizId });
        expect(quiz).toBeNull();
        expect(attempt).toBeNull();
    });
  });
});

