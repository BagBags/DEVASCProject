# Testing Quick Reference Card

## 🚀 Quick Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.test.js

# Run tests matching pattern
npm test -- --testNamePattern="login"

# Verbose output
npm test -- --verbose
```

## 📊 Current Status

✅ **21/21 tests passing** (100%)
- Authentication: 6 tests
- Profile Management: 5 tests  
- Itinerary Management: 10 tests

⏱️ **Execution Time**: ~8-9 seconds

## 🎯 What's Tested

### Authentication
- ✅ User registration with OTP
- ✅ Email uniqueness validation
- ✅ OTP verification
- ✅ Login (valid/invalid credentials)
- ✅ Unverified user login

### Profile Management
- ✅ Get profile (authenticated)
- ✅ Unauthorized access prevention
- ✅ Update profile info
- ✅ Email update validation
- ✅ Account updates

### Itinerary Management
- ✅ Create itinerary
- ✅ Required field validation
- ✅ Authentication requirement
- ✅ Get all itineraries
- ✅ Get single itinerary
- ✅ Update itinerary
- ✅ Authorization checks
- ✅ Delete itinerary
- ✅ 404 handling

## 🔧 Test Environment

- **Database**: MongoDB Memory Server (in-memory)
- **Email**: Mocked (no real emails sent)
- **JWT**: Test secret configured
- **Isolation**: Complete (no external dependencies)

## 📁 Test Files

```
__tests__/
├── setup.js           # Environment config & mocks
├── testDb.js          # Database utilities
├── auth.test.js       # Authentication tests
├── profile.test.js    # Profile tests
└── itinerary.test.js  # Itinerary tests
```

## 🔄 CI/CD Integration

Tests run automatically on:
- ✅ Push to `main` or `develop`
- ✅ Pull requests
- ✅ Blocks deployment if tests fail

## 📝 Adding New Tests

```javascript
// 1. Import dependencies
const request = require('supertest');
const app = require('../app');
const { connectDB, closeDB } = require('./testDb');

// 2. Create test suite
describe('Feature Name', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  // 3. Write tests
  it('should do something', async () => {
    const res = await request(app)
      .get('/api/endpoint')
      .expect(200);
    
    expect(res.body).toHaveProperty('field');
  });
});
```

## 🐛 Common Issues

### Tests timeout?
```javascript
it('test name', async () => {
  // test code
}, 10000); // 10 second timeout
```

### Need to debug?
```bash
npm test -- --verbose
```

### JWT errors?
Check `__tests__/setup.js` has `JWT_SECRET` set

### Database issues?
Ensure `mongodb-memory-server` is installed:
```bash
npm install --save-dev mongodb-memory-server
```

## 📚 Documentation

- **Full Guide**: `__tests__/README.md`
- **Implementation Summary**: `TEST_IMPLEMENTATION_SUMMARY.md`
- **Completion Report**: `TESTING_COMPLETE.md`

## 🎓 Best Practices

1. ✅ Test isolation (independent tests)
2. ✅ Clear test names
3. ✅ Arrange-Act-Assert pattern
4. ✅ Test success AND failure cases
5. ✅ Use descriptive assertions

## 📞 Need Help?

1. Check `__tests__/README.md` for detailed guide
2. Review existing test files for patterns
3. Run with `--verbose` for more details
4. Check Jest documentation: https://jestjs.io

---

**Status**: ✅ All systems operational
**Last Updated**: November 10, 2025
