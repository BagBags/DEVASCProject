const app = require('./app');
const mongoose = require('mongoose');

// MongoDB connection (non-blocking for EB health checks)
async function connectDB() {
  // Skip if already connected or in test environment
  if (mongoose.connection.readyState >= 1) return;

  if (!process.env.MONGO_URI) {
    console.warn('⚠️  MONGO_URI not set. Database features will be unavailable.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Don't exit in production to allow the app to run in a degraded state
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
}

// Connect to DB (non-blocking)
connectDB().catch(err => console.error("DB connection failed:", err));

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server successfully started on port ${PORT}`);
  console.log(`🌐 Listening on 0.0.0.0:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (error) => {
  console.error('❌ Server failed to start:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});
