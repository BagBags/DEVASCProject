# Backend Testing Guide

## Overview
This directory contains automated tests for the Juander Tourism Management Backend API. The tests cover authentication, profile management, and itinerary management features.

## Test Structure

```
__tests__/
├── README.md                 # This file
├── setup.js                  # Jest configuration and mocks
├── testDb.js                 # MongoDB Memory Server utilities
├── auth.test.js              # Authentication tests
├── profile.test.js           # Profile management tests
└── itinerary.test.js         # Itinerary CRUD tests
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (for development)
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run a specific test file
```bash
npm test -- auth.test.js
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="login"
```

## Test Coverage

Current test coverage includes:

### Authentication (`auth.test.js`)
- ✅ User registration with OTP email
- ✅ Duplicate email prevention
- ✅ OTP verification and user activation
- ✅ Login with valid credentials
- ✅ Login with invalid password
- ✅ Login with unverified account

### Profile Management (`profile.test.js`)
- ✅ Get user profile with authentication
- ✅ Unauthorized access prevention
- ✅ Update profile information
- ✅ Email uniqueness validation
- ✅ Account information updates

### Itinerary Management (`itinerary.test.js`)
- ✅ Create new itinerary
- ✅ Validation of required fields
- ✅ Authentication requirement
- ✅ Get all user itineraries
- ✅ Get single itinerary by ID
- ✅ 404 for non-existent itinerary
- ✅ Update existing itinerary
- ✅ Authorization (can't update others' itineraries)
- ✅ Delete itinerary
- ✅ 404 when deleting non-existent itinerary

## Test Environment

### Environment Variables
The following environment variables are set in `setup.js`:
- `NODE_ENV=test`
- `JWT_SECRET=test-secret-for-testing-12345`
- `MONGO_URI=mongodb://localhost:27017/juander_test`

### Database
Tests use **MongoDB Memory Server** which provides:
- In-memory MongoDB instance
- No external dependencies
- Automatic cleanup
- Fast test execution
- Complete isolation from production/development databases

### Mocked Services
- **Nodemailer**: Email sending is mocked to capture OTP codes without sending real emails
- **Environment Variables**: Test-specific values are set before tests run

## Writing New Tests

### Basic Test Structure
```javascript
const request = require('supertest');
const app = require('../app');
const { connectDB, closeDB, clearDB } = require('./testDb');

describe('Feature Name', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  afterEach(async () => {
    await clearDB();
  });

  it('should do something', async () => {
    const res = await request(app)
      .get('/api/endpoint')
      .expect(200);
    
    expect(res.body).toHaveProperty('expectedField');
  });
});
```

### Testing Authenticated Endpoints
```javascript
// Create a verified user
const user = await createVerifiedUser({
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'Test@1234'
});

// Login to get token
const loginRes = await request(app)
  .post('/api/auth/login')
  .send({
    email: 'test@example.com',
    password: 'Test@1234'
  });

const token = loginRes.body.token;

// Use token in subsequent requests
const res = await request(app)
  .get('/api/auth/me')
  .set('Authorization', `Bearer ${token}`)
  .expect(200);
```

### Testing OTP Flow
```javascript
// Register user (sends OTP)
await request(app)
  .post('/api/auth/register')
  .send(userData);

// Get OTP from global test context
const otp = global.__TEST_OTP__;

// Verify OTP
await request(app)
  .post('/api/auth/verify-otp')
  .send({ email: userData.email, otp });
```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `beforeEach` and `afterEach` to set up and clean up
- Don't rely on test execution order

### 2. Clear Test Names
```javascript
// Good
it('should return 404 when itinerary does not exist', async () => {});

// Bad
it('test itinerary', async () => {});
```

### 3. Arrange-Act-Assert Pattern
```javascript
it('should create a new itinerary', async () => {
  // Arrange
  const itineraryData = { name: 'Test', description: 'Test' };
  
  // Act
  const res = await request(app)
    .post('/api/itineraries')
    .set('Authorization', `Bearer ${token}`)
    .send(itineraryData);
  
  // Assert
  expect(res.statusCode).toEqual(201);
  expect(res.body).toHaveProperty('name', itineraryData.name);
});
```

### 4. Test Both Success and Failure Cases
```javascript
describe('User Login', () => {
  it('should login with valid credentials', async () => {
    // Test success case
  });

  it('should not login with invalid password', async () => {
    // Test failure case
  });
});
```

### 5. Use Descriptive Assertions
```javascript
// Good
expect(res.body.user).toHaveProperty('email', 'test@example.com');

// Less clear
expect(res.body.user.email).toBe('test@example.com');
```

## Debugging Tests

### View Test Output
```bash
npm test -- --verbose
```

### Run a Single Test
```bash
npm test -- --testNamePattern="should create a new itinerary"
```

### Debug with Node Inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Common Issues

#### Tests Timeout
Increase timeout in specific tests:
```javascript
it('should complete long operation', async () => {
  // test code
}, 10000); // 10 second timeout
```

#### Database Connection Issues
Ensure MongoDB Memory Server is properly installed:
```bash
npm install --save-dev mongodb-memory-server
```

#### JWT Errors
Verify `JWT_SECRET` is set in `setup.js`

## CI/CD Integration

Tests run automatically on:
- Every push to `main` or `develop` branches
- Every pull request to `main` or `develop` branches

The workflow will:
1. Set up Node.js environment
2. Install dependencies
3. Run all tests
4. Generate coverage report
5. Upload coverage to Codecov (if configured)
6. Block deployment if tests fail

## Coverage Goals

Current coverage targets:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

View coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure all tests pass before committing
3. Maintain or improve code coverage
4. Follow existing test patterns and naming conventions

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Testing Best Practices](https://testingjavascript.com/)
