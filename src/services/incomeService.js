import { incomeModel } from '../models/incomeModel.js';
import { NotFoundError } from '../utils/errorHandler.js';

export const incomeService = {
  async getIncome(userId) {
    return incomeModel.findAll(userId);
  },

  async getIncomeById(userId, incomeId) {
    const record = await incomeModel.findById(userId, incomeId);
    if (!record) {
      throw new NotFoundError('Income record not found.');
    }
    return record;
  },

  async createIncome(userId, data) {
    return incomeModel.create(userId, data);
  },

  async updateIncome(userId, incomeId, updates) {
    await this.getIncomeById(userId, incomeId);
    return incomeModel.update(userId, incomeId, updates);
  },

  async deleteIncome(userId, incomeId) {
    await this.getIncomeById(userId, incomeId);
    return incomeModel.delete(userId, incomeId);
  }
};
