const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

// Middleware to protect routes by verifying JWT
const auth = async (req, res, next) => {
  try {
    let token;

    // Check if the Authorization header contains a Bearer token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Extract the token part from 'Bearer <token>'
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token is provided, return 401 Unauthorized
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    // Verify the token using the secret key
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Find the user by ID from the decoded token payload
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    // Attach the user object to the request for the next middleware/route handler
    req.user = user;
    next();
  } catch (error) {
    // If token verification fails, return 401
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

module.exports = auth;
