import { supabase } from '../config/supabase.js';

export const budgetModel = {
  async findByPeriod(userId, month, year) {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', Number(month))
      .eq('year', Number(year));

    if (error) {
      throw new Error(`Failed to fetch budgets: ${error.message}`);
    }
    return data || [];
  },

  async findById(userId, budgetId) {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('id', budgetId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch budget: ${error.message}`);
    }
    return data || null;
  },

  async findByCategory(userId, category, month, year) {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .eq('month', Number(month))
      .eq('year', Number(year))
      .single();

    if (error && error.code !== 'PGRST116') {
      return null;
    }
    return data || null;
  },

  async create(userId, budgetData) {
    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: userId,
        category: budgetData.category,
        amount: Number(budgetData.amount),
        month: Number(budgetData.month),
        year: Number(budgetData.year)
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create budget: ${error.message}`);
    }
    return data;
  },

  async update(userId, budgetId, updates) {
    const payload = { ...updates };
    if (payload.amount !== undefined) {
      payload.amount = Number(payload.amount);
    }

    const { data, error } = await supabase
      .from('budgets')
      .update(payload)
      .eq('user_id', userId)
      .eq('id', budgetId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update budget: ${error.message}`);
    }
    return data;
  },

  async delete(userId, budgetId) {
    const { data, error } = await supabase
      .from('budgets')
      .delete()
      .eq('user_id', userId)
      .eq('id', budgetId);

    if (error) {
      throw new Error(`Failed to delete budget: ${error.message}`);
    }
    return true;
  }
};
