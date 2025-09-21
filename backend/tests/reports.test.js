const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

let trainerToken, studentToken, courseId, studentId;

describe('Reports API Endpoints', () => {
  beforeAll(async () => {
    const trainerRes = await request(app).post('/api/auth/register').send({ name: 'Report Trainer', email: 'report.trainer@test.com', password: 'password123' });
    trainerToken = trainerRes.body.token;
    const studentRes = await request(app).post('/api/auth/register').send({ name: 'Report Student', email: 'report.student@test.com', password: 'password123' });
    studentToken = studentRes.body.token;
    const student = await User.findOne({email: 'report.student@test.com'});
    studentId = student._id;
    const courseRes = await request(app).post('/api/courses').set('x-auth-token', trainerToken).send({ title: 'Reporting Course', description: 'Desc' });
    courseId = courseRes.body._id;
    const quizRes = await request(app).post('/api/quizzes').set('x-auth-token', trainerToken).send({ title: 'Reporting Quiz', courseId, questions: [{ questionText: 'Q1', options: ['A', 'B'], correctAnswer: 'A' }] });
    await request(app).post(`/api/quizzes/${quizRes.body._id}/submit`).set('x-auth-token', studentToken).send({ answers: [] });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Course.deleteMany({});
    await Quiz.deleteMany({});
    await QuizAttempt.deleteMany({});
    await mongoose.connection.close();
  });

  it('should allow a trainer to get a student progress report', async () => {
    const res = await request(app).get(`/api/reports/student/${studentId}/course/${courseId}`).set('x-auth-token', trainerToken);
    expect(res.statusCode).toEqual(200);
    expect(res.body.student.name).toBe('Report Student');
    expect(res.body.attempts.length).toBe(1);
  });
});

