// Set the environment to test FIRST
process.env.NODE_ENV = 'test';

// Set critical environment variables before loading anything else
process.env.JWT_SECRET = 'test-secret-for-testing-12345';
process.env.MONGO_URI = 'mongodb://localhost:27017/juander_test';

// Load environment variables from .env.test (will not override already set vars)
require('dotenv').config({ path: '.env.test' });

// Mock nodemailer
jest.mock('nodemailer');
const nodemailer = require('nodemailer');

// Mock the createTransport method
const mockSendMail = jest.fn((mailOptions, callback) => {
  // Extract OTP from the email body for testing
  const otpMatch = mailOptions.text && mailOptions.text.match(/\b\d{6}\b/);
  const otp = otpMatch ? otpMatch[0] : null;
  
  // Store the OTP in the global test context
  if (otp) {
    global.__TEST_OTP__ = otp;
  }
  
  // Simulate successful email sending
  if (callback && typeof callback === 'function') {
    callback(null, { messageId: 'test-message-id' });
  }
  
  // Return a promise for async/await usage
  return Promise.resolve({ messageId: 'test-message-id' });
});

nodemailer.createTransport.mockReturnValue({
  sendMail: mockSendMail
});

// Increase test timeout
jest.setTimeout(30000);
