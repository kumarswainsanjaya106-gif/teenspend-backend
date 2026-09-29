import { supabase } from '../config/supabase.js';

export const goalModel = {
  async findAll(userId) {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch savings goals: ${error.message}`);
    }
    return data || [];
  },

  async findById(userId, goalId) {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('id', goalId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch savings goal: ${error.message}`);
    }
    return data || null;
  },

  async create(userId, goalData) {
    const { data, error } = await supabase
      .from('savings_goals')
      .insert({
        user_id: userId,
        name: goalData.name,
        target_amount: Number(goalData.target_amount),
        current_amount: Number(goalData.current_amount || 0),
        target_date: goalData.target_date || null,
        description: goalData.description || ''
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create savings goal: ${error.message}`);
    }
    return data;
  },

  async update(userId, goalId, updates) {
    const payload = { ...updates };
    if (payload.target_amount !== undefined) {
      payload.target_amount = Number(payload.target_amount);
    }
    if (payload.current_amount !== undefined) {
      payload.current_amount = Number(payload.current_amount);
    }

    const { data, error } = await supabase
      .from('savings_goals')
      .update(payload)
      .eq('user_id', userId)
      .eq('id', goalId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update savings goal: ${error.message}`);
    }
    return data;
  },

  async addContribution(userId, goalId, contributionAmount) {
    const current = await this.findById(userId, goalId);
    if (!current) {
      throw new Error('Savings goal not found');
    }

    const newAmount = Number(current.current_amount) + Number(contributionAmount);
    return this.update(userId, goalId, { current_amount: newAmount });
  },

  async delete(userId, goalId) {
    const { data, error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('user_id', userId)
      .eq('id', goalId);

    if (error) {
      throw new Error(`Failed to delete savings goal: ${error.message}`);
    }
    return true;
  }
};
