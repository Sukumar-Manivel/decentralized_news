const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

// Define the schema for a User
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true, // Email is mandatory
    unique: true, // No duplicate emails allowed
    lowercase: true, // Always store as lowercase
    trim: true // Remove whitespace from ends
  },
  password: {
    type: String,
    required: true, // Password is mandatory
    minlength: 6, // Minimum 6 characters
    select: false // Do not return password by default in queries
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['citizen', 'journalist', 'admin'], // Allowed values
    default: 'citizen'
  },
  phone: {
    type: String
  },
  walletBalance: {
    type: Number,
    default: 0 // Stored in paise (smallest currency unit)
  },
  creditPoints: {
    type: Number,
    default: 0
  },
  reporterLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  totalUploads: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Pre-save hook to hash the password before saving it to the database
userSchema.pre('save', async function(next) {
  // Only hash if the password has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare an entered password with the hashed password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate a JSON Web Token (JWT) for the user
userSchema.methods.generateAuthToken = function() {
  // The payload contains user info, signed with the secret key
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

// Export the User model
module.exports = mongoose.model('User', userSchema);
