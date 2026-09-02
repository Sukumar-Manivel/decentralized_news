const dotenv = require('dotenv');

// Load environment variables from .env file into process.env
dotenv.config();

// Export all environment variables with default fallback values
module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/citizenlens',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d'
};
