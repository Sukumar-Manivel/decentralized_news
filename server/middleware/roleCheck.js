// Factory function that creates middleware to check if user has a required role
const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    // Ensure that req.user exists (auth middleware must be run first)
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    // Check if the user's role is in the array of allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access forbidden: Insufficient permissions' 
      });
    }

    // Role is allowed, proceed to next handler
    next();
  };
};

module.exports = roleCheck;
