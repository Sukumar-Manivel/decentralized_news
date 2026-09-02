const mongoose = require('mongoose');

// Connect to MongoDB (MongoDB Atlas cloud or local)
const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      tlsAllowInvalidCertificates: true
    });
    console.log(`✅ MongoDB Connected to: ${uri.includes('@') ? 'Cloud (MongoDB Atlas)' : uri}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error('👉 Please make sure your MONGODB_URI in server/.env is set to a valid MongoDB Atlas connection string.');
    process.exit(1);
  }
};

module.exports = connectDB;

