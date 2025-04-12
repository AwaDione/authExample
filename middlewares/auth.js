
// middlewares/auth.js
const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/utilisateur');

exports.createToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

exports.optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const user = await Utilisateur.findById(decodedToken.userId);
      
      if (user) {
        req.user = user;
        req.isAuthenticated = true;
      } else {
        req.isAuthenticated = false;
      }
    } else {
      req.isAuthenticated = false;
    }
    next();
  } catch (error) {
    req.isAuthenticated = false;
    next();
  }
};