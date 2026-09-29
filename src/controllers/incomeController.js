import { incomeService } from '../services/incomeService.js';
import { successResponse } from '../utils/responseHandler.js';

export const incomeController = {
  async getIncome(req, res, next) {
    try {
      const records = await incomeService.getIncome(req.user.id);
      return successResponse(res, records, 'Income records retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  async getIncomeById(req, res, next) {
    try {
      const record = await incomeService.getIncomeById(req.user.id, req.params.id);
      return successResponse(res, record, 'Income record retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  async createIncome(req, res, next) {
    try {
      const record = await incomeService.createIncome(req.user.id, req.body);
      return successResponse(res, record, 'Income record added successfully!', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateIncome(req, res, next) {
    try {
      const updated = await incomeService.updateIncome(req.user.id, req.params.id, req.body);
      return successResponse(res, updated, 'Income record updated successfully.');
    } catch (err) {
      next(err);
    }
  },

  async deleteIncome(req, res, next) {
    try {
      await incomeService.deleteIncome(req.user.id, req.params.id);
      return successResponse(res, null, 'Income record deleted successfully.');
    } catch (err) {
      next(err);
    }
  }
};
