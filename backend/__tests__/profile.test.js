const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { connectDB, closeDB, clearDB } = require('./testDb');
const User = require('../models/userModel');
const argon2 = require('argon2');

// Test data
const testUser = {
  firstName: 'Profile',
  lastName: 'Test',
  email: 'profiletest@example.com',
  password: 'Test@1234'
};

// Helper function to create a verified user directly in the database
const createVerifiedUser = async (userData) => {
  // Delete any existing users with the same email
  await User.deleteMany({ email: userData.email });
  
  // Hash the password
  const hashedPassword = await argon2.hash(userData.password);
  
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

describe('Profile Management API Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await connectDB();
    
    // Create a verified test user
    const user = await createVerifiedUser(testUser);
    userId = user._id;
    
    // Login to get token
    const loginRes = await loginUser({
      email: testUser.email,
      password: testUser.password
    });
    
    authToken = loginRes.body.token;
    
    // Debug: Log token info
    if (!authToken) {
      console.error('Login failed!');
      console.error('Status:', loginRes.statusCode);
      console.error('Body:', loginRes.body);
      throw new Error('Failed to get auth token');
    }
  });

  afterAll(async () => {
    await closeDB();
  });

  afterEach(async () => {
    // Don't clear the database between tests to keep the authenticated user
    // Only clear itineraries and other test data if needed
  });

  describe('Get User Profile', () => {
    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('email', testUser.email);
      expect(res.body).toHaveProperty('firstName', testUser.firstName);
      expect(res.body).toHaveProperty('lastName', testUser.lastName);
    });

    it('should return 401 without valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me');
      
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('Update User Profile', () => {
    it('should update user profile with valid data', async () => {
      const updatedData = {
        firstName: 'Updated',
        lastName: 'User'
      };
      
      const res = await request(app)
        .put('/api/auth/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...updatedData,
          email: testUser.email // Email is required for the update endpoint
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('firstName', updatedData.firstName);
      expect(res.body).toHaveProperty('lastName', updatedData.lastName);
      
      // Verify the update in the database
      const updatedUser = await User.findById(userId);
      expect(updatedUser.firstName).toBe(updatedData.firstName);
      expect(updatedUser.lastName).toBe(updatedData.lastName);
    });

    it('should not update email to an existing one', async () => {
      // Create another user
      const anotherUser = {
        firstName: 'Another',
        lastName: 'User',
        email: 'another@example.com',
        password: 'Test@1234',
        isVerified: true
      };
      
      await createVerifiedUser(anotherUser);
      
      // Try to update profile with the new user's email
      const res = await request(app)
        .put('/api/auth/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          email: anotherUser.email
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].msg).toContain('Email is already in use');
    });
    
    it('should update account info including email', async () => {
      const newEmail = 'updated.email@example.com';
      const updatedData = {
        firstName: 'Updated',
        lastName: 'Name',
        email: newEmail
      };
      
      // Update account info
      const res = await request(app)
        .put('/api/auth/account')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', newEmail);
      expect(res.body.user).toHaveProperty('firstName', updatedData.firstName);
      expect(res.body.user).toHaveProperty('lastName', updatedData.lastName);
      
      // Verify the update in the database
      const updatedUser = await User.findById(userId);
      expect(updatedUser.email).toBe(newEmail);
      expect(updatedUser.firstName).toBe(updatedData.firstName);
      expect(updatedUser.lastName).toBe(updatedData.lastName);
    });
  });
});
