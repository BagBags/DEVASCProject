const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { connectDB, closeDB, clearDB } = require('./testDb');
const User = require('../models/userModel');
const PendingUser = require('../models/pendingUserModel');

// Test data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'Test@1234'
};

// Helper function to create a verified user directly in the database
const createVerifiedUser = async (userData) => {
  // Delete any existing users with the same email
  await User.deleteMany({ email: userData.email });
  await PendingUser.deleteMany({ email: userData.email });
  
  // Hash the password
  const hashedPassword = await require('argon2').hash(userData.password);
  
  // Create a verified user
  const user = await User.create({
    ...userData,
    password: hashedPassword,
    isVerified: true,
    profileCompleted: true
  });
  
  return user;
};

// Helper function to login a user and return the auth token
const loginUser = async (credentials) => {
  const res = await request(app)
    .post('/api/auth/login')
    .send(credentials);
  
  return res;
};

describe('Authentication API Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  afterEach(async () => {
    // Clear users and pending users after each test
    await User.deleteMany({});
    await PendingUser.deleteMany({});
  });

  describe('User Registration', () => {
    it('should register a new user and send OTP', async () => {
      // Clear any existing users
      await User.deleteMany({});
      await PendingUser.deleteMany({});
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('OTP sent');
      
      // Verify a pending user was created
      const pendingUser = await PendingUser.findOne({ email: testUser.email });
      expect(pendingUser).toBeTruthy();
      expect(pendingUser.firstName).toBe(testUser.firstName);
      expect(pendingUser.lastName).toBe(testUser.lastName);
    });

    it('should not register user with existing email', async () => {
      // First create a verified user
      await createVerifiedUser(testUser);
      
      // Try to register with same email again
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.statusCode).toEqual(409);
      expect(res.body.message).toContain('Email already exists');
    });
    
    it('should verify OTP and complete registration', async () => {
      // First register a user (which creates a pending user)
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      // Get the OTP from the global test context (set by our mock)
      const otp = global.__TEST_OTP__;
      expect(otp).toBeDefined();
      
      // Verify the OTP
      const verifyRes = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: testUser.email,
          otp: otp
        });
      
      expect(verifyRes.statusCode).toEqual(200);
      expect(verifyRes.body).toHaveProperty('message');
      expect(verifyRes.body).toHaveProperty('userId');
      expect(verifyRes.body.message).toContain('Email verified successfully');
      
      // Verify the user was moved from pending to active
      const pendingUser = await PendingUser.findOne({ email: testUser.email });
      expect(pendingUser).toBeNull();
      
      const activeUser = await User.findOne({ email: testUser.email });
      expect(activeUser).toBeTruthy();
      expect(activeUser.isVerified).toBe(true);
      expect(activeUser.email).toBe(testUser.email);
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Create a verified user before each test
      await createVerifiedUser(testUser);
    });

    it('should login with valid credentials', async () => {
      const res = await loginUser({
        email: testUser.email,
        password: testUser.password
      });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toHaveProperty('email', testUser.email);
      expect(res.body.user).toHaveProperty('firstName', testUser.firstName);
      expect(res.body.user).toHaveProperty('lastName', testUser.lastName);
    });

    it('should not login with invalid password', async () => {
      const res = await loginUser({
        email: testUser.email,
        password: 'wrongpassword'
      });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toContain('Invalid email or password');
    });
    
    it('should allow login even with unverified account', async () => {
      // Create an unverified user
      await User.deleteMany({});
      await User.create({
        ...testUser,
        password: await require('argon2').hash(testUser.password),
        isVerified: false
      });
      
      const res = await loginUser({
        email: testUser.email,
        password: testUser.password
      });
      
      // The current implementation allows unverified users to login
      expect(res.statusCode).toEqual(200);
      expect(res.body.token).toBeDefined();
    });
  });
});
