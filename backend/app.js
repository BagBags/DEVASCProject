// Load environment variables (skip in test mode as it's handled by Jest setup)
if (process.env.NODE_ENV !== 'test') {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const mongoSanitize = require("express-mongo-sanitize");
const authRoute = require("./routes/authRoute");
const itineraryRoute = require("./routes/itineraryRoute");
const pinRoute = require("./routes/pinRoute");
const categoryRoute = require("./routes/categoryRoute");
const maskRoute = require("./routes/maskRoute");
const { verifyAdmin } = require("./middleware/authMiddleware");

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Log environment info (only in non-test environment)
if (process.env.NODE_ENV !== 'test') {
  console.log("🚀 Starting Juander Backend...");
  console.log("📦 NODE_ENV:", process.env.NODE_ENV);
  console.log("🔌 PORT:", process.env.PORT || 5000);
  console.log("🗄️  MONGO_URI:", process.env.MONGO_URI ? "SET ✓" : "MISSING ✗");
  console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET ? "SET ✓" : "MISSING ✗");
}

// Health check endpoint (for EB)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/', (req, res) => {
  res.send('Juander Backend API is running');
});

// API routes - Essential routes for core features + map
app.use('/api/auth', authRoute);
app.use('/api/itineraries', itineraryRoute);
app.use('/api/pins', pinRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/masks', maskRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

module.exports = app;
