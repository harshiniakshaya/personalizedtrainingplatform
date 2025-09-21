# 🧩 Backend Testing Guide

This document provides a comprehensive overview of the testing strategy, tools, and processes used in this project. The testing suite is designed to ensure that the backend API is **reliable, functional, and secure**.

---

## 🏗 Core Philosophy

Our testing approach emphasizes **integration testing**.
Instead of testing individual functions in isolation, we validate the entire request lifecycle:

* API endpoint
* Controller
* Model
* Database

This ensures that features work as they would in **real-world scenarios**.

---

## 🛠 Testing Toolkit

The testing environment uses the following libraries:

* **Jest** - Core testing framework and runner
* **Supertest** - HTTP assertion library for simulating API requests to Express endpoints
* **MongoDB Memory Server** - Provides a temporary, in-memory MongoDB instance to ensure tests run in a clean, isolated environment without affecting development data

---

## 🔄 Testing Lifecycle

When running `npm test`, the following process is executed:

* **Global Setup (`tests/setup.js`)**

   * Starts MongoDB Memory Server
   * Generates a temporary connection string (`MONGO_URI_TEST`)
   * Application connects to the temporary database

* **Test Execution (`tests/*.test.js`)**

   * Jest discovers and executes all `.test.js` files
   * Organized into suites (`describe`) and cases (`it`)
   * Hooks (`beforeAll`, `beforeEach`, `afterEach`) ensure data isolation

* **Global Teardown (`tests/teardown.js`)**

   * Stops MongoDB Memory Server
   * Cleans up temporary resources

---

## ⚡ Running the Tests

### Prerequisites

* Node.js and npm installed
* No local MongoDB instance is required - the test suite provides its own

### Installation

```bash
npm install
```

### Execution

```bash
npm test
```

Jest will run all test suites and output a summary in the terminal.

---

## 📂 Test File Structure

```
/tests
├── setup.js          # Starts the in-memory database
├── teardown.js       # Stops the in-memory database
├── auth.test.js      # Authentication tests (register, login, tokens)
├── course.test.js    # Course management tests
├── quiz.test.js      # Quiz lifecycle tests
├── admin.test.js     # Admin-only feature tests
├── reports.test.js   # Report generation tests
└── user.test.js      # Trainer-specific user management tests
```

---

## 📝 Writing a New Test

All tests follow the **Arrange → Act → Assert** pattern:

* **Arrange**: Define initial conditions (e.g., create a user)
* **Act**: Perform the action being tested (e.g., API request with Supertest)
* **Assert**: Validate the outcome using Jest’s `expect` assertions

### Example

```js
// in tests/your-feature.test.js
describe('Your Feature API Endpoints', () => {
    it('should perform the expected action', async () => {
        // Arrange
        const user = await User.create({
            name: 'Test',
            email: 'test@test.com',
            password: '123'
        });

        // Act
        const response = await request(app)
            .post('/api/your-feature/endpoint')
            .send({ someData: 'data' });

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Success!');
    });
});
```

---

## ✅ Summary

* Integration-first testing strategy for realistic reliability
* Jest, Supertest, and MongoDB Memory Server ensure a clean test environment
* Clear test organization by feature enables scalability and maintainability
* Quick execution with `npm test` - no external DB dependencies
