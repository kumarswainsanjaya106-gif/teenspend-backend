import { authService } from '../services/authService.js';
import { successResponse } from '../utils/responseHandler.js';

export const authController = {
  async register(req, res, next) {
    try {
      const { user, token } = await authService.register(req.body);
      return successResponse(
        res,
        { user, token },
        'Account created successfully! Welcome to TeenSpend.',
        201
      );
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { user, token } = await authService.login(req.body);
      return successResponse(
        res,
        { user, token },
        'Logged in successfully. Welcome back!'
      );
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      // In JWT stateless auth, logout is handled client-side by discarding token.
      return successResponse(res, null, 'Logged out successfully.');
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      return successResponse(res, user, 'User profile fetched successfully.');
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const updatedUser = await authService.updateProfile(req.user.id, req.body);
      return successResponse(res, updatedUser, 'Profile updated successfully.');
    } catch (err) {
      next(err);
    }
  }
};
