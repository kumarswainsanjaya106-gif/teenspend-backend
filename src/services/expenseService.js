import { expenseModel } from '../models/expenseModel.js';
import { NotFoundError } from '../utils/errorHandler.js';

export const expenseService = {
  async getExpenses(userId, query) {
    return expenseModel.findAll(userId, query);
  },

  async getExpenseById(userId, expenseId) {
    const expense = await expenseModel.findById(userId, expenseId);
    if (!expense) {
      throw new NotFoundError('Expense not found.');
    }
    return expense;
  },

  async createExpense(userId, data) {
    return expenseModel.create(userId, data);
  },

  async updateExpense(userId, expenseId, updates) {
    // Verify existence and ownership
    await this.getExpenseById(userId, expenseId);
    return expenseModel.update(userId, expenseId, updates);
  },

  async deleteExpense(userId, expenseId) {
    // Verify existence and ownership
    await this.getExpenseById(userId, expenseId);
    return expenseModel.delete(userId, expenseId);
  }
};
