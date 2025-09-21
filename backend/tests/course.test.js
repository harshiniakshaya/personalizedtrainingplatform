const request = require('supertest');
const app = require('../server'); // Adjust path if your main server file is different
const User = require('../models/User');
const Course = require('../models/Course');
const mongoose = require('mongoose');

// This test suite covers all API endpoints related to courses.
describe('Course API Endpoints', () => {
    let trainerToken;
    let studentToken;
    let trainerId;
    let studentId;

    // This block runs once before any tests in this file.
    // It sets up a clean environment by creating necessary user roles and getting their auth tokens.
    beforeAll(async () => {
        // Ensure a clean slate before starting
        await User.deleteMany({});
        
        // Create a user with the 'trainer' role
        const trainer = await User.create({ name: 'Course Trainer', email: 'course.trainer@example.com', password: 'password123', role: 'trainer' });
        trainerId = trainer._id;

        // Create a user with the 'student' role
        const student = await User.create({ name: 'Course Student', email: 'course.student@example.com', password: 'password123', role: 'student' });
        studentId = student._id;

        // Log in as the trainer to get an authentication token
        const trainerLoginRes = await request(app).post('/api/auth/login').send({ email: 'course.trainer@example.com', password: 'password123' });
        trainerToken = trainerLoginRes.body.token;

        // Log in as the student to get an authentication token
        const studentLoginRes = await request(app).post('/api/auth/login').send({ email: 'course.student@example.com', password: 'password123' });
        studentToken = studentLoginRes.body.token;
    });

    // After each individual test, clear the Course collection.
    // This prevents courses created in one test from affecting another.
    afterEach(async () => {
        await Course.deleteMany({});
    });

    // After all tests in this file are complete, clean up the users.
    afterAll(async () => {
        await User.deleteMany({});
    });

    // Tests for the course creation endpoint
    describe('POST /api/courses', () => {
        it('should allow a trainer to create a new course', async () => {
            const res = await request(app)
                .post('/api/courses')
                .set('x-auth-token', trainerToken)
                .send({ title: 'New Course by Trainer', description: 'A great new course.' });
            
            expect(res.statusCode).toEqual(201); // 201 Created
            expect(res.body).toHaveProperty('title', 'New Course by Trainer');
            expect(res.body.trainer.toString()).toEqual(trainerId.toString());
        });

        it('should forbid a student from creating a course', async () => {
            const res = await request(app)
                .post('/api/courses')
                .set('x-auth-token', studentToken)
                .send({ title: 'Student Course Attempt', description: 'This should not be created.' });
            
            expect(res.statusCode).toEqual(403); // 403 Forbidden
            expect(res.body.msg).toBe('Access denied. Not authorized as a trainer.');
        });
    });

    // Tests for the endpoint that retrieves courses
    describe('GET /api/courses', () => {
        // Before running these specific tests, create a sample course 
        // that the trainer owns and the student is enrolled in.
        beforeEach(async () => {
            await Course.create({ 
                title: 'Shared Course', 
                description: 'A course for both users', 
                trainer: trainerId,
                students: [studentId]
            });
        });

        it('should return courses for the trainer who created them', async () => {
             const res = await request(app)
                .get('/api/courses')
                .set('x-auth-token', trainerToken);

            expect(res.statusCode).toEqual(200); // 200 OK
            expect(res.body).toHaveLength(1);
            expect(res.body[0].title).toBe('Shared Course');
        });

        it('should return courses for the student who is enrolled in them', async () => {
             const res = await request(app)
                .get('/api/courses')
                .set('x-auth-token', studentToken);
                
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].title).toBe('Shared Course');
        });
    });
});

