import { supabase } from '../config/supabase.js';

export const recurringModel = {
  async findAll(userId) {
    const { data, error } = await supabase
      .from('recurring_expenses')
      .select('*')
      .eq('user_id', userId)
      .order('next_payment_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch recurring expenses: ${error.message}`);
    }
    return data || [];
  },

  async findById(userId, recurringId) {
    const { data, error } = await supabase
      .from('recurring_expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('id', recurringId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch recurring expense: ${error.message}`);
    }
    return data || null;
  },

  async create(userId, data) {
    const { data: created, error } = await supabase
      .from('recurring_expenses')
      .insert({
        user_id: userId,
        name: data.name,
        amount: Number(data.amount),
        frequency: data.frequency,
        next_payment_date: data.next_payment_date,
        category: data.category || 'Subscriptions',
        is_active: data.is_active !== undefined ? data.is_active : true
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create recurring expense: ${error.message}`);
    }
    return created;
  },

  async update(userId, recurringId, updates) {
    const payload = { ...updates };
    if (payload.amount !== undefined) {
      payload.amount = Number(payload.amount);
    }

    const { data, error } = await supabase
      .from('recurring_expenses')
      .update(payload)
      .eq('user_id', userId)
      .eq('id', recurringId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update recurring expense: ${error.message}`);
    }
    return data;
  },

  async delete(userId, recurringId) {
    const { data, error } = await supabase
      .from('recurring_expenses')
      .delete()
      .eq('user_id', userId)
      .eq('id', recurringId);

    if (error) {
      throw new Error(`Failed to delete recurring expense: ${error.message}`);
    }
    return true;
  }
};
