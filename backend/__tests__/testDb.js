const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  try {
    // Create in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    // Connect to the in-memory database
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB Test Database Connected');
    return conn;
  } catch (error) {
    console.error(`Error connecting to test database: ${error.message}`);
    process.exit(1);
  }
};

const closeDB = async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('Test database connection closed');
  } catch (error) {
    console.error(`Error closing test database: ${error.message}`);
    process.exit(1);
  }
};

const clearDB = async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error(`Error clearing test database: ${error.message}`);
  }
};

module.exports = { connectDB, closeDB, clearDB };
