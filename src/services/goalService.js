import { goalModel } from '../models/goalModel.js';
import { NotFoundError } from '../utils/errorHandler.js';

export const goalService = {
  async getGoals(userId) {
    const goals = await goalModel.findAll(userId);

    // Enrich goals with calculations
    return goals.map((g) => {
      const target = Number(g.target_amount);
      const current = Number(g.current_amount);
      const remaining = Math.max(0, target - current);
      const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

      // Calculate suggested weekly contribution if target_date exists
      let suggestedWeeklyContribution = null;
      let daysRemaining = null;

      if (g.target_date && remaining > 0) {
        const targetDate = new Date(g.target_date);
        const today = new Date();
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysRemaining = diffDays > 0 ? diffDays : 0;

        if (daysRemaining > 0) {
          const weeksRemaining = Math.max(1, daysRemaining / 7);
          suggestedWeeklyContribution = Number((remaining / weeksRemaining).toFixed(2));
        }
      }

      return {
        ...g,
        target_amount: target,
        current_amount: current,
        remaining: Number(remaining.toFixed(2)),
        percentage,
        isCompleted: current >= target,
        daysRemaining,
        suggestedWeeklyContribution
      };
    });
  },

  async getGoalById(userId, goalId) {
    const goal = await goalModel.findById(userId, goalId);
    if (!goal) {
      throw new NotFoundError('Savings goal not found.');
    }
    return goal;
  },

  async createGoal(userId, data) {
    return goalModel.create(userId, data);
  },

  async updateGoal(userId, goalId, updates) {
    await this.getGoalById(userId, goalId);
    return goalModel.update(userId, goalId, updates);
  },

  async addContribution(userId, goalId, amount) {
    await this.getGoalById(userId, goalId);
    return goalModel.addContribution(userId, goalId, amount);
  },

  async deleteGoal(userId, goalId) {
    await this.getGoalById(userId, goalId);
    return goalModel.delete(userId, goalId);
  }
};
