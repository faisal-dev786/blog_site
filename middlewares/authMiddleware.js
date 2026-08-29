import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/user.js';

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.userId).select('-password');

      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
    throw new Error('Not authorized, no token');
  }
});

export default authMiddleware;