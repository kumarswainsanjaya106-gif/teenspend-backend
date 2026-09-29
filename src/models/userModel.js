import { supabase } from '../config/supabase.js';

export const userModel = {
  async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database error fetching user: ${error.message}`);
    }
    return data || null;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, age, currency, monthly_income, savings_goal, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database error fetching user: ${error.message}`);
    }
    return data || null;
  },

  async create(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: userData.name,
        email: userData.email.toLowerCase(),
        password_hash: userData.password_hash,
        age: userData.age,
        currency: userData.currency || 'USD',
        monthly_income: userData.monthly_income || 0,
        savings_goal: userData.savings_goal || 0
      })
      .select('id, name, email, age, currency, monthly_income, savings_goal, created_at, updated_at')
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, name, email, age, currency, monthly_income, savings_goal, created_at, updated_at')
      .single();

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
    return data;
  }
};
