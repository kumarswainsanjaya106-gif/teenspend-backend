import { recurringModel } from '../models/recurringModel.js';
import { NotFoundError } from '../utils/errorHandler.js';

export const recurringService = {
  async getRecurring(userId) {
    const items = await recurringModel.findAll(userId);

    // Calculate total monthly impact of subscriptions
    let totalMonthlyCost = 0;
    const enriched = items.map((item) => {
      const amount = Number(item.amount);
      let monthlyEquivalent = amount;

      if (item.frequency === 'Weekly') {
        monthlyEquivalent = Number((amount * 4.333).toFixed(2));
      } else if (item.frequency === 'Yearly') {
        monthlyEquivalent = Number((amount / 12).toFixed(2));
      }

      if (item.is_active) {
        totalMonthlyCost += monthlyEquivalent;
      }

      return {
        ...item,
        amount,
        monthlyEquivalent
      };
    });

    return {
      subscriptions: enriched,
      totalMonthlyCost: Number(totalMonthlyCost.toFixed(2)),
      count: items.length
    };
  },

  async getRecurringById(userId, id) {
    const item = await recurringModel.findById(userId, id);
    if (!item) {
      throw new NotFoundError('Recurring expense record not found.');
    }
    return item;
  },

  async createRecurring(userId, data) {
    return recurringModel.create(userId, data);
  },

  async updateRecurring(userId, id, updates) {
    await this.getRecurringById(userId, id);
    return recurringModel.update(userId, id, updates);
  },

  async deleteRecurring(userId, id) {
    await this.getRecurringById(userId, id);
    return recurringModel.delete(userId, id);
  }
};
