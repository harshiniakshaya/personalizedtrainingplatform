const request = require('supertest');
const app = require('../server'); // Adjust this path if your server entry file is named differently
const User = require('../models/User');

// This test suite focuses on the authentication routes: /api/auth
describe('Auth API Endpoints', () => {

    // Before each individual test, clear the User collection to ensure a clean state.
    // This is crucial for preventing tests from interfering with each other.
    beforeEach(async () => {
        await User.deleteMany({});
    });

    // Test the user registration functionality
    describe('POST /api/auth/register', () => {
        it('should successfully register a new user and return a token', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toEqual(201); // 201 Created
            expect(res.body).toHaveProperty('token');
        });

        it('should fail to register a user if the email already exists', async () => {
            // First, create a user to ensure the email is already in the database
            await User.create({ name: 'Existing User', email: 'test@example.com', password: 'password123' });
            
            // Then, attempt to register again with the same email
            const res = await request(app)
                .post('/api/auth/register')
                .send({ name: 'Another User', email: 'test@example.com', password: 'password456' });
            
            expect(res.statusCode).toEqual(400); // 400 Bad Request
            expect(res.body.msg).toBe('User with this email already exists');
        });
    });

    // Test the user login functionality
    describe('POST /api/auth/login', () => {
        // Before running login tests, create a user to log in with.
        beforeEach(async () => {
             await User.create({ name: 'Login User', email: 'login@example.com', password: 'password123' });
        });

        it('should successfully log in an existing user and return a token', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'login@example.com', password: 'password123' });

            expect(res.statusCode).toEqual(200); // 200 OK
            expect(res.body).toHaveProperty('token');
        });

        it('should fail to log in with an incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'login@example.com', password: 'wrongpassword' });
            
            expect(res.statusCode).toEqual(400);
            expect(res.body.msg).toBe('Invalid credentials');
        });

        it('should fail to log in if the user does not exist', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'nouser@example.com', password: 'password123' });
            
            expect(res.statusCode).toEqual(400);
            expect(res.body.msg).toBe('Invalid credentials');
        });
    });

    // Test the protected route for fetching the current user's data
    describe('GET /api/auth/me', () => {
        it('should return the logged-in user\'s data if the token is valid', async () => {
            // Register a user to get a valid token
            const registerRes = await request(app)
                .post('/api/auth/register')
                .send({ name: 'Me User', email: 'me@example.com', password: 'password123' });
            
            const token = registerRes.body.token;

            // Use the token to access the protected route
            const res = await request(app)
                .get('/api/auth/me')
                .set('x-auth-token', token);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('name', 'Me User');
            expect(res.body).toHaveProperty('email', 'me@example.com');
            expect(res.body).not.toHaveProperty('password'); // Ensure password is not sent back
        });

        it('should return a 401 error if no token is provided', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.statusCode).toEqual(401); // 401 Unauthorized
            expect(res.body.msg).toBe('No token, authorization denied');
        });
    });
});

