const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { connectDB, closeDB, clearDB } = require('./testDb');
const User = require('../models/userModel');
const Itinerary = require('../models/itineraryModel');
const argon2 = require('argon2');

// Test data
const testUser = {
  firstName: 'Itinerary',
  lastName: 'Test',
  email: 'itinerarytest@example.com',
  password: 'Test@1234'
};

const testItinerary = {
  name: 'Test Itinerary',
  description: 'A test itinerary',
  duration: 120, // 2 hours in minutes
  sites: [], // Empty array for now, can be populated with Pin IDs if needed
  imageUrl: 'https://example.com/test-image.jpg'
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

describe('Itinerary Management API Tests', () => {
  let authToken;
  let userId;
  let itineraryId;

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
    // Clear only itineraries, not users (to keep authentication working)
    const Itinerary = require('../models/itineraryModel');
    await Itinerary.deleteMany({});
  });

  describe('Create Itinerary', () => {
    it('should create a new itinerary', async () => {
      const res = await request(app)
        .post('/api/itineraries')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testItinerary);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('name', testItinerary.name);
      expect(res.body).toHaveProperty('createdBy');
      
      // Verify the itinerary was saved in the database
      const savedItinerary = await Itinerary.findById(res.body._id);
      expect(savedItinerary).toBeTruthy();
      expect(savedItinerary.name).toBe(testItinerary.name);
      
      itineraryId = res.body._id;
    });

    it('should not create itinerary without required fields', async () => {
      const invalidItinerary = { ...testItinerary };
      delete invalidItinerary.name;
      
      const res = await request(app)
        .post('/api/itineraries')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidItinerary);
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
    
    it('should not create itinerary without authentication', async () => {
      const res = await request(app)
        .post('/api/itineraries')
        .send(testItinerary);
      
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('Get Itineraries', () => {
    beforeEach(async () => {
      // Create a test itinerary
      const res = await request(app)
        .post('/api/itineraries')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testItinerary);
      
      itineraryId = res.body._id;
    });

    it('should get all itineraries for the user', async () => {
      const res = await request(app)
        .get('/api/itineraries')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('name', testItinerary.name);
    });

    it('should get a single itinerary by ID', async () => {
      const res = await request(app)
        .get(`/api/itineraries/${itineraryId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id', itineraryId);
      expect(res.body).toHaveProperty('name', testItinerary.name);
    });
    
    it('should return 404 for non-existent itinerary', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/itineraries/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('Update Itinerary', () => {
    beforeEach(async () => {
      // Create a test itinerary
      const res = await request(app)
        .post('/api/itineraries')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testItinerary);
      
      itineraryId = res.body._id;
    });

    it('should update an existing itinerary', async () => {
      const updatedData = {
        name: 'Updated Itinerary',
        description: 'Updated description'
      };
      
      const res = await request(app)
        .put(`/api/itineraries/${itineraryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('name', updatedData.name);
      expect(res.body).toHaveProperty('description', updatedData.description);
      
      // Verify the update in the database
      const updatedItinerary = await Itinerary.findById(itineraryId);
      expect(updatedItinerary.name).toBe(updatedData.name);
      expect(updatedItinerary.description).toBe(updatedData.description);
    });
    
    it('should not update another user\'s itinerary', async () => {
      // Create another user
      const anotherUser = {
        firstName: 'Another',
        lastName: 'User',
        email: 'another@example.com',
        password: 'Test@1234',
        isVerified: true
      };
      
      const newUser = await createVerifiedUser(anotherUser);
      
      // Login as the new user
      const loginRes = await loginUser({
        email: anotherUser.email,
        password: anotherUser.password
      });
      
      // Try to update the itinerary with the new user's token
      const res = await request(app)
        .put(`/api/itineraries/${itineraryId}`)
        .set('Authorization', `Bearer ${loginRes.body.token}`)
        .send({
          name: 'Unauthorized Update'
        });
      
      expect(res.statusCode).toEqual(403);
    });
  });

  describe('Delete Itinerary', () => {
    beforeEach(async () => {
      // Create a test itinerary
      const res = await request(app)
        .post('/api/itineraries')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testItinerary);
      
      itineraryId = res.body._id;
    });

    it('should delete an existing itinerary', async () => {
      // First verify the itinerary exists
      const initialItinerary = await Itinerary.findById(itineraryId);
      expect(initialItinerary).toBeTruthy();
      
      // Delete the itinerary
      const res = await request(app)
        .delete(`/api/itineraries/${itineraryId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');
      
      // Verify it's deleted
      const deletedItinerary = await Itinerary.findById(itineraryId);
      expect(deletedItinerary).toBeNull();
    });
    
    it('should return 404 when deleting non-existent itinerary', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/itineraries/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toEqual(404);
    });
  });
});
