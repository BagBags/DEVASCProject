// Load environment variables
require("dotenv").config();

console.log("🚀 Starting Juander Backend...");
console.log("📦 NODE_ENV:", process.env.NODE_ENV);
console.log("🔌 PORT:", process.env.PORT || 5000);
console.log("🗄️  MONGO_URI:", process.env.MONGO_URI ? "SET ✓" : "MISSING ✗");
console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET ? "SET ✓" : "MISSING ✗");

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


// Needed for resolving __dirname in CommonJS
const app = express();

// Health check endpoint (for EB)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Juander Backend API',
    status: 'running',
    version: '1.0.0'
  });
});

app.use(
  cors({
    origin: [
      "http://localhost:5173", // Development
      "http://juander-frontend.s3-website-ap-southeast-2.amazonaws.com", // Production S3
      "https://d39zx5gyblzxjs.cloudfront.net", // Production Frontend CloudFront HTTPS
      "https://d3des4qdhz53rp.cloudfront.net", // Production Backend CloudFront HTTPS
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600, // Cache preflight for 10 minutes
  })
);

// Increase payload size limits for video uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// app.use(
//   mongoSanitize({
//     replaceWith: "_", // Replaces any special characters like $, ., etc. with an underscore
//     sanitizeQuery: false, // Disable sanitizing of query parameters
//   })
// );
// MongoDB connection (non-blocking for EB health checks)
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("⚠️  MONGO_URI not set. Database features will be unavailable.");
      return;
    }
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    console.error("⚠️  App will continue without database. Fix MONGO_URI and restart.");
    // Don't exit - let app start for health checks
  }
};

// Connect to DB (non-blocking)
connectDB().catch(err => console.error("DB connection failed:", err));

// API routes - Essential routes for core features + map
app.use("/api/auth", authRoute);
app.use("/api/itineraries", itineraryRoute);
app.use("/api/userItineraries", itineraryRoute);
app.use("/api/pins", pinRoute);
app.use("/api/mask", maskRoute);
app.use("/api/admin/categories", verifyAdmin, categoryRoute);

// Static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  "/uploads/profile",
  express.static(path.join(__dirname, "uploads/profile"))
);
app.use(
  "/uploads/itineraries",
  express.static(path.join(__dirname, "uploads/itineraries"))
);
app.use(
  "/uploads/userItineraries",
  express.static(path.join(__dirname, "uploads/userItineraries"))
);
// // Serve frontend in production +++
// if (process.env.NODE_ENV === "production") {
//   const __dirname = path.resolve();
//   app.use(express.static(path.join(__dirname, "frontend", "build")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
//   });
// }

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 5000;

try {
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
} catch (error) {
  console.error('❌ Fatal error starting server:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
