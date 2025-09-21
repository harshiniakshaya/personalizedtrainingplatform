const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

let trainerToken;

describe('User Management API Endpoints (Trainer)', () => {
  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({ name: 'UserMgt Trainer', email: 'usermgt.trainer@test.com', password: 'password123' });
    const loginRes = await request(app).post('/api/auth/login').send({ email: 'usermgt.trainer@test.com', password: 'password123' });
    trainerToken = loginRes.body.token;
  });

  afterEach(async () => {
    await User.deleteMany({ role: 'student' });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('should allow a trainer to create a new student', async () => {
    const res = await request(app).post('/api/users/students').set('x-auth-token', trainerToken).send({ name: 'New Student', email: 'student.trainer@test.com', password: 'password123' });
    expect(res.statusCode).toEqual(201);
  });

  it('should allow a trainer to get a list of all students', async () => {
    await request(app).post('/api/users/students').set('x-auth-token', trainerToken).send({ name: 'Student One', email: 'student.one@test.com', password: 'password123' });
    const res = await request(app).get('/api/users/students').set('x-auth-token', trainerToken);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
  });
});

