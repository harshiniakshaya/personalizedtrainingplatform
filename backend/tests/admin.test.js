const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

let adminToken;
let trainer;

describe('Admin API Endpoints', () => {
  beforeAll(async () => {
    await User.create({ name: 'Admin', email: 'admin@test.com', password: 'password123', role: 'admin' });
    const adminLoginRes = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'password123' });
    adminToken = adminLoginRes.body.token;
    await request(app).post('/api/auth/register').send({ name: 'Sample Trainer', email: 'trainer.sample@test.com', password: 'password123' });
    trainer = await User.findOne({ email: 'trainer.sample@test.com' });
  });
  
  afterAll(async () => {
      await User.deleteMany({});
      await mongoose.connection.close();
  });

  it('should get all non-admin users', async () => {
    const res = await request(app).get('/api/admin/users').set('x-auth-token', adminToken);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
  });
  
  it('should create a new user', async () => {
      const newUser = { name: 'New Student', email: 'student.new@test.com', password: 'password123', role: 'student' };
      const res = await request(app).post('/api/admin/users').set('x-auth-token', adminToken).send(newUser);
      expect(res.statusCode).toEqual(201);
  });

  it('should delete a user', async () => {
    const res = await request(app).delete(`/api/admin/users/${trainer._id}`).set('x-auth-token', adminToken);
    expect(res.statusCode).toEqual(200);
    const deletedUser = await User.findById(trainer._id);
    expect(deletedUser).toBeNull();
  });
});

