import { supabase } from '../config/supabase.js';

export const expenseModel = {
  async findAll(userId, filters = {}) {
    const {
      page = 1,
      limit = 20,
      category,
      payment_method,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      sortBy = 'date',
      sortOrder = 'desc'
    } = filters;

    let query = supabase
      .from('expenses')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (category) {
      query = query.eq('category', category);
    }

    if (payment_method) {
      query = query.eq('payment_method', payment_method);
    }

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    if (minAmount !== undefined) {
      query = query.gte('amount', minAmount);
    }

    if (maxAmount !== undefined) {
      query = query.lte('amount', maxAmount);
    }

    if (search) {
      query = query.ilike('description', `%${search}%`);
    }

    // Sorting
    const isAscending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending: isAscending });

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch expenses: ${error.message}`);
    }

    const total = count !== null && count !== undefined ? count : (data ? data.length : 0);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      expenses: data || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      }
    };
  },

  async findById(userId, expenseId) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('id', expenseId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch expense: ${error.message}`);
    }
    return data || null;
  },

  async create(userId, expenseData) {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        amount: Number(expenseData.amount),
        category: expenseData.category,
        description: expenseData.description,
        date: expenseData.date || new Date().toISOString().split('T')[0],
        payment_method: expenseData.payment_method || 'Cash',
        notes: expenseData.notes || ''
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create expense: ${error.message}`);
    }
    return data;
  },

  async update(userId, expenseId, updates) {
    const payload = { ...updates };
    if (payload.amount !== undefined) {
      payload.amount = Number(payload.amount);
    }

    const { data, error } = await supabase
      .from('expenses')
      .update(payload)
      .eq('user_id', userId)
      .eq('id', expenseId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update expense: ${error.message}`);
    }
    return data;
  },

  async delete(userId, expenseId) {
    const { data, error } = await supabase
      .from('expenses')
      .delete()
      .eq('user_id', userId)
      .eq('id', expenseId);

    if (error) {
      throw new Error(`Failed to delete expense: ${error.message}`);
    }
    return true;
  },

  async getRange(userId, startDate, endDate) {
    let query = supabase
      .from('expenses')
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
      throw new Error(`Failed to fetch expenses in range: ${error.message}`);
    }
    return data || [];
  }
};
