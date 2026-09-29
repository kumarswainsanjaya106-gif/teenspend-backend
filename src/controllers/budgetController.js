import { budgetService } from '../services/budgetService.js';
import { successResponse } from '../utils/responseHandler.js';

export const budgetController = {
  async getBudgets(req, res, next) {
    try {
      const { month, year } = req.query;
      const budgets = await budgetService.getBudgets(req.user.id, month, year);
      return successResponse(res, budgets, 'Budgets retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  async getBudgetById(req, res, next) {
    try {
      const budget = await budgetService.getBudgetById(req.user.id, req.params.id);
      return successResponse(res, budget, 'Budget retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  async createBudget(req, res, next) {
    try {
      const budget = await budgetService.createBudget(req.user.id, req.body);
      return successResponse(res, budget, 'Budget configured successfully!', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateBudget(req, res, next) {
    try {
      const updated = await budgetService.updateBudget(req.user.id, req.params.id, req.body);
      return successResponse(res, updated, 'Budget updated successfully.');
    } catch (err) {
      next(err);
    }
  },

  async deleteBudget(req, res, next) {
    try {
      await budgetService.deleteBudget(req.user.id, req.params.id);
      return successResponse(res, null, 'Budget removed successfully.');
    } catch (err) {
      next(err);
    }
  }
};
