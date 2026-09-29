import { analyticsService } from '../services/analyticsService.js';
import { successResponse } from '../utils/responseHandler.js';

export const insightController = {
  async getInsights(req, res, next) {
    try {
      const data = await analyticsService.getDashboard(req.user.id);
      return successResponse(res, data.insights, 'Personalized insights generated successfully.');
    } catch (err) {
      next(err);
    }
  }
};
