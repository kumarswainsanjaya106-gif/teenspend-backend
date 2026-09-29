import { recurringService } from '../services/recurringService.js';
import { successResponse } from '../utils/responseHandler.js';

export const recurringController = {
  async getRecurring(req, res, next) {
    try {
      const data = await recurringService.getRecurring(req.user.id);
      return successResponse(res, data, 'Recurring expenses retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  async getRecurringById(req, res, next) {
    try {
      const item = await recurringService.getRecurringById(req.user.id, req.params.id);
      return successResponse(res, item, 'Recurring expense retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  async createRecurring(req, res, next) {
    try {
      const created = await recurringService.createRecurring(req.user.id, req.body);
      return successResponse(res, created, 'Recurring expense created successfully!', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateRecurring(req, res, next) {
    try {
      const updated = await recurringService.updateRecurring(req.user.id, req.params.id, req.body);
      return successResponse(res, updated, 'Recurring expense updated successfully.');
    } catch (err) {
      next(err);
    }
  },

  async deleteRecurring(req, res, next) {
    try {
      await recurringService.deleteRecurring(req.user.id, req.params.id);
      return successResponse(res, null, 'Recurring expense deleted successfully.');
    } catch (err) {
      next(err);
    }
  }
};
