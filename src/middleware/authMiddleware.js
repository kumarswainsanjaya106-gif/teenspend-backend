import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { UnauthorizedError } from '../utils/errorHandler.js';
import { userModel } from '../models/userModel.js';

export const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Authentication token missing. Please log in.');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Session expired. Please log in again.');
      }
      throw new UnauthorizedError('Invalid authentication token.');
    }

    if (!decoded || !decoded.id) {
      throw new UnauthorizedError('Malformed token payload.');
    }

    const user = await userModel.findById(decoded.id);
    if (!user) {
      throw new UnauthorizedError('User account associated with this token no longer exists.');
    }

    // Attach sanitized user to request context (excluding password_hash)
    const { password_hash, ...safeUser } = user;
    req.user = safeUser;

    next();
  } catch (error) {
    next(error);
  }
};
