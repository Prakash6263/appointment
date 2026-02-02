const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/location-service';
    
    const connection = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`[DATABASE] Connected to MongoDB at ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error(`[DATABASE] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
