import { budgetModel } from '../models/budgetModel.js';
import { expenseModel } from '../models/expenseModel.js';
import { NotFoundError } from '../utils/errorHandler.js';

export const budgetService = {
  async getBudgets(userId, month, year) {
    const targetMonth = month ? Number(month) : new Date().getMonth() + 1;
    const targetYear = year ? Number(year) : new Date().getFullYear();

    const budgets = await budgetModel.findByPeriod(userId, targetMonth, targetYear);

    // Calculate start & end date for the target month
    const startStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(targetYear, targetMonth, 0).getDate();
    const endStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const expenses = await expenseModel.getRange(userId, startStr, endStr);

    // Sum expenses by category
    const categorySpending = {};
    expenses.forEach((exp) => {
      const cat = exp.category;
      categorySpending[cat] = (categorySpending[cat] || 0) + Number(exp.amount);
    });

    // Enrich budgets with actual spending data
    const enriched = budgets.map((b) => {
      const spent = categorySpending[b.category] || 0;
      const budgetAmount = Number(b.amount);
      const remaining = Math.max(0, budgetAmount - spent);
      const percentageUsed = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

      let status = 'normal';
      let message = 'On track';

      if (percentageUsed >= 100) {
        status = 'exceeded';
        message = `You have reached your ${b.category} budget for this month.`;
      } else if (percentageUsed >= 80) {
        status = 'warning';
        message = `You've used about ${percentageUsed}% of your ${b.category} budget.`;
      }

      return {
        ...b,
        amount: budgetAmount,
        spent: Number(spent.toFixed(2)),
        remaining: Number(remaining.toFixed(2)),
        percentageUsed,
        status,
        message
      };
    });

    return enriched;
  },

  async getBudgetById(userId, budgetId) {
    const budget = await budgetModel.findById(userId, budgetId);
    if (!budget) {
      throw new NotFoundError('Budget not found.');
    }
    return budget;
  },

  async createBudget(userId, data) {
    const month = data.month || new Date().getMonth() + 1;
    const year = data.year || new Date().getFullYear();

    const existing = await budgetModel.findByCategory(userId, data.category, month, year);
    if (existing) {
      // If already exists for this period, update it smoothly
      return budgetModel.update(userId, existing.id, { amount: data.amount });
    }

    return budgetModel.create(userId, {
      ...data,
      month,
      year
    });
  },

  async updateBudget(userId, budgetId, updates) {
    await this.getBudgetById(userId, budgetId);
    return budgetModel.update(userId, budgetId, updates);
  },

  async deleteBudget(userId, budgetId) {
    await this.getBudgetById(userId, budgetId);
    return budgetModel.delete(userId, budgetId);
  }
};
