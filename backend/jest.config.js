module.exports = {
  // Sets the test environment to Node.js.
  testEnvironment: 'node',

  // Halts test execution after the first test failure.
  bail: 1,

  // Resets mock state between every test.
  clearMocks: true,

  // Specifies the directory for code coverage reports.
  coverageDirectory: 'coverage',

  // Defines the root directory for Jest to search for test files.
  roots: ['<rootDir>'],

  // Sets a timeout for each test script.
  testTimeout: 30000,

  // Path to a setup script that runs once before all test suites.
  globalSetup: './tests/setup.js',
  
  // Path to a teardown script that runs once after all test suites.
  globalTeardown: './tests/teardown.js'
};
