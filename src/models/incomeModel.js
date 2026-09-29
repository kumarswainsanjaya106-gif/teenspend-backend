import { supabase } from '../config/supabase.js';

export const incomeModel = {
  async findAll(userId) {
    const { data, error } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch income records: ${error.message}`);
    }
    return data || [];
  },

  async findById(userId, incomeId) {
    const { data, error } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .eq('id', incomeId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch income record: ${error.message}`);
    }
    return data || null;
  },

  async create(userId, incomeData) {
    const { data, error } = await supabase
      .from('income')
      .insert({
        user_id: userId,
        amount: Number(incomeData.amount),
        source: incomeData.source,
        date: incomeData.date || new Date().toISOString().split('T')[0],
        notes: incomeData.notes || ''
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create income record: ${error.message}`);
    }
    return data;
  },

  async update(userId, incomeId, updates) {
    const payload = { ...updates };
    if (payload.amount !== undefined) {
      payload.amount = Number(payload.amount);
    }

    const { data, error } = await supabase
      .from('income')
      .update(payload)
      .eq('user_id', userId)
      .eq('id', incomeId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update income record: ${error.message}`);
    }
    return data;
  },

  async delete(userId, incomeId) {
    const { data, error } = await supabase
      .from('income')
      .delete()
      .eq('user_id', userId)
      .eq('id', incomeId);

    if (error) {
      throw new Error(`Failed to delete income record: ${error.message}`);
    }
    return true;
  },

  async getRange(userId, startDate, endDate) {
    let query = supabase
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch income in range: ${error.message}`);
    }
    return data || [];
  }
};
