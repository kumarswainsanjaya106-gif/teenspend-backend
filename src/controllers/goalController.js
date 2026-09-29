import { goalService } from '../services/goalService.js';
import { successResponse } from '../utils/responseHandler.js';

export const goalController = {
  async getGoals(req, res, next) {
    try {
      const goals = await goalService.getGoals(req.user.id);
      return successResponse(res, goals, 'Savings goals retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  async getGoalById(req, res, next) {
    try {
      const goal = await goalService.getGoalById(req.user.id, req.params.id);
      return successResponse(res, goal, 'Savings goal retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  async createGoal(req, res, next) {
    try {
      const goal = await goalService.createGoal(req.user.id, req.body);
      return successResponse(res, goal, 'Savings goal created successfully!', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateGoal(req, res, next) {
    try {
      const updated = await goalService.updateGoal(req.user.id, req.params.id, req.body);
      return successResponse(res, updated, 'Savings goal updated successfully.');
    } catch (err) {
      next(err);
    }
  },

  async addContribution(req, res, next) {
    try {
      const updated = await goalService.addContribution(req.user.id, req.params.id, req.body.amount);
      return successResponse(res, updated, 'Savings contribution added successfully!');
    } catch (err) {
      next(err);
    }
  },

  async deleteGoal(req, res, next) {
    try {
      await goalService.deleteGoal(req.user.id, req.params.id);
      return successResponse(res, null, 'Savings goal deleted successfully.');
    } catch (err) {
      next(err);
    }
  }
};
