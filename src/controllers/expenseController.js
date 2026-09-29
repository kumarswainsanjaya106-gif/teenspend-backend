import { expenseService } from '../services/expenseService.js';
import { successResponse } from '../utils/responseHandler.js';

export const expenseController = {
  async getExpenses(req, res, next) {
    try {
      const result = await expenseService.getExpenses(req.user.id, req.query);
      return res.status(200).json({
        success: true,
        message: 'Expenses retrieved successfully',
        data: result.expenses,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  },

  async getExpenseById(req, res, next) {
    try {
      const expense = await expenseService.getExpenseById(req.user.id, req.params.id);
      return successResponse(res, expense, 'Expense retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  async createExpense(req, res, next) {
    try {
      const expense = await expenseService.createExpense(req.user.id, req.body);
      return successResponse(res, expense, 'Expense recorded successfully!', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateExpense(req, res, next) {
    try {
      const updated = await expenseService.updateExpense(req.user.id, req.params.id, req.body);
      return successResponse(res, updated, 'Expense updated successfully.');
    } catch (err) {
      next(err);
    }
  },

  async deleteExpense(req, res, next) {
    try {
      await expenseService.deleteExpense(req.user.id, req.params.id);
      return successResponse(res, null, 'Expense deleted successfully.');
    } catch (err) {
      next(err);
    }
  }
};
