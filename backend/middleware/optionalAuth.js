// backend/middleware/optionalAuth.js
// Tries to authenticate if Authorization header exists, otherwise continues without error
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const header = req.header('Authorization');
    if (!header) return next();

    const token = header.replace('Bearer ', '');
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user) req.user = user;
    return next();
  } catch (err) {
    // Ignore token errors for optional auth
    return next();
  }
};