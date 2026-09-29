import { analyticsService } from '../services/analyticsService.js';
import { successResponse } from '../utils/responseHandler.js';

export const analyticsController = {
  async getDashboard(req, res, next) {
    try {
      const data = await analyticsService.getDashboard(req.user.id);
      return successResponse(res, data, 'Dashboard analytics retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  async getSummary(req, res, next) {
    try {
      const data = await analyticsService.getDashboard(req.user.id);
      return successResponse(res, data.summary, 'Summary analytics retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  async getCategory(req, res, next) {
    try {
      const data = await analyticsService.getDashboard(req.user.id);
      return successResponse(res, data.categoryBreakdown, 'Category analytics retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  async getMonthly(req, res, next) {
    try {
      const data = await analyticsService.getDashboard(req.user.id);
      return successResponse(res, data.monthlyTrend, 'Monthly trend retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  async getTrends(req, res, next) {
    try {
      const data = await analyticsService.getDashboard(req.user.id);
      return successResponse(res, {
        dailySpending: data.dailySpending,
        monthlyTrend: data.monthlyTrend
      }, 'Trends retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }
};
