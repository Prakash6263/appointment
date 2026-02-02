require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const locationRoutes = require('./routes/locationRoutes');

// Import middleware
const { globalLimiter } = require('./middleware/rateLimiter');

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Apply global rate limiter
app.use(globalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Location Service is running',
    timestamp: new Date().toISOString()
  });
});

// Location routes
app.use('/api/location', locationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/location-service';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('[DATABASE] Successfully connected to MongoDB');
  } catch (error) {
    console.error('[DATABASE] Connection error:', error.message);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
let server;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start listening
    server = app.listen(PORT, () => {
      console.log(`[SERVER] Location Service running on port ${PORT}`);
      console.log(`[SERVER] Health check: http://localhost:${PORT}/api/health`);
      console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('[SERVER] Failed to start:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM signal received: closing HTTP server');
  if (server) {
    server.close(() => {
      console.log('[SERVER] HTTP server closed');
      mongoose.connection.close();
      process.exit(0);
    });
  } else {
    console.log('[SERVER] No server to close');
    process.exit(0);
  }
});

startServer();
