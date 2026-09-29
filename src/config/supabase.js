import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Global in-memory storage for development fallback when Supabase credentials are not provided
const mockStorage = {
  users: [],
  expenses: [],
  income: [],
  budgets: [],
  savings_goals: [],
  recurring_expenses: [],
  custom_categories: []
};

// Seed initial developer data for Alex into mockStorage
const initMockData = async () => {
  if (mockStorage.users.length > 0) return;

  const alexId = '00000000-0000-0000-0000-000000000001';
  const hashedPw = await bcrypt.hash('password123', 12);

  mockStorage.users.push({
    id: alexId,
    name: 'Alex Chen',
    email: 'alex@example.test',
    password_hash: hashedPw,
    age: 16,
    currency: 'USD',
    monthly_income: 240,
    savings_goal: 150,
    created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
    updated_at: new Date().toISOString()
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const todayStr = now.toISOString().split('T')[0];

  // Helper date formatter
  const daysAgo = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  mockStorage.expenses.push(
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      amount: 8.50,
      category: 'Food',
      description: "McDonald's with friends",
      date: daysAgo(1),
      payment_method: 'Debit Card',
      notes: 'Weekend hangout',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      amount: 4.25,
      category: 'Snacks',
      description: 'Boba milk tea after school',
      date: daysAgo(2),
      payment_method: 'Digital Wallet',
      notes: 'Taro with pearls',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      amount: 15.00,
      category: 'Gaming',
      description: 'Steam Indie Game Discount',
      date: daysAgo(4),
      payment_method: 'Digital Wallet',
      notes: 'Hollow Knight sale',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      amount: 12.00,
      category: 'School',
      description: 'Physics notebook & pens',
      date: daysAgo(6),
      payment_method: 'Cash',
      notes: 'Stationery shop',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      amount: 2.50,
      category: 'Transport',
      description: 'Bus fare to downtown',
      date: daysAgo(7),
      payment_method: 'Debit Card',
      notes: 'Transit pass tap',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      amount: 5.99,
      category: 'Subscriptions',
      description: 'Spotify Student Subscription',
      date: daysAgo(10),
      payment_method: 'Debit Card',
      notes: 'Monthly music',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      amount: 14.50,
      category: 'Entertainment',
      description: 'Cinema movie ticket',
      date: daysAgo(12),
      payment_method: 'Digital Wallet',
      notes: 'Sci-fi movie night',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      amount: 18.00,
      category: 'Hobbies',
      description: 'Guitar picks & spare strings',
      date: daysAgo(15),
      payment_method: 'Cash',
      notes: 'Music store',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      amount: 22.00,
      category: 'Shopping',
      description: 'Hoodie from thrift shop',
      date: daysAgo(18),
      payment_method: 'Debit Card',
      notes: 'Great vintage find',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  );

  mockStorage.income.push(
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      amount: 40.00,
      source: 'Weekly Allowance',
      date: daysAgo(14),
      notes: 'Chore completion',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      amount: 40.00,
      source: 'Weekly Allowance',
      date: daysAgo(7),
      notes: 'Chore completion',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      amount: 60.00,
      source: 'Neighborhood Dog Walking',
      date: daysAgo(5),
      notes: '3 days of walking neighbors dog',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      amount: 50.00,
      source: 'Birthday Gift',
      date: daysAgo(20),
      notes: 'From Grandma',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  );

  mockStorage.budgets.push(
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      category: 'Food',
      amount: 50.00,
      month: currentMonth,
      year: currentYear,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      category: 'Snacks',
      amount: 25.00,
      month: currentMonth,
      year: currentYear,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      category: 'Entertainment',
      amount: 40.00,
      month: currentMonth,
      year: currentYear,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      category: 'Gaming',
      amount: 30.00,
      month: currentMonth,
      year: currentYear,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      category: 'Transport',
      amount: 20.00,
      month: currentMonth,
      year: currentYear,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  );

  mockStorage.savings_goals.push(
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      name: 'Sony Noise-Canceling Headphones',
      target_amount: 150.00,
      current_amount: 85.00,
      target_date: daysAgo(-45),
      description: 'For studying with focus and listening to music on the bus',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      name: 'Summer Skate Camp',
      target_amount: 250.00,
      current_amount: 110.00,
      target_date: daysAgo(-120),
      description: 'One-week summer skateboarding workshop with friends',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  );

  mockStorage.recurring_expenses.push(
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      name: 'Spotify Premium Student',
      amount: 5.99,
      frequency: 'Monthly',
      next_payment_date: daysAgo(-18),
      category: 'Subscriptions',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      name: 'Nintendo Switch Online',
      amount: 3.99,
      frequency: 'Monthly',
      next_payment_date: daysAgo(-10),
      category: 'Gaming',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: alexId,
      name: 'iCloud 50GB Backup',
      amount: 0.99,
      frequency: 'Monthly',
      next_payment_date: daysAgo(-5),
      category: 'Subscriptions',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  );
};

// Initialize mock data in background
initMockData().catch(console.error);

// Mock Query Builder that mirrors Supabase Client syntax
class MockQueryBuilder {
  constructor(tableName) {
    this.tableName = tableName;
    this.filters = [];
    this.selectColumns = '*';
    this.orderConfig = null;
    this.rangeConfig = null;
    this.limitCount = null;
    this.isSingle = false;
    this.countOnly = false;
    this.operation = 'select'; // 'select' | 'insert' | 'update' | 'delete'
    this.payload = null;
  }

  select(columns = '*', options = {}) {
    this.selectColumns = columns;
    if (options.count === 'exact') {
      this.countOnly = true;
    }
    return this;
  }

  insert(values) {
    this.operation = 'insert';
    this.payload = values;
    return this;
  }

  update(values) {
    this.operation = 'update';
    this.payload = values;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  eq(column, value) {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  neq(column, value) {
    this.filters.push((row) => row[column] !== value);
    return this;
  }

  gte(column, value) {
    this.filters.push((row) => row[column] >= value);
    return this;
  }

  lte(column, value) {
    this.filters.push((row) => row[column] <= value);
    return this;
  }

  ilike(column, pattern) {
    const regex = new RegExp(pattern.replace(/%/g, '.*'), 'i');
    this.filters.push((row) => regex.test(row[column] || ''));
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.orderConfig = { column, ascending };
    return this;
  }

  range(from, to) {
    this.rangeConfig = { from, to };
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  // Execute the query
  async then(resolve, reject) {
    try {
      if (!mockStorage[this.tableName]) {
        mockStorage[this.tableName] = [];
      }
      const table = mockStorage[this.tableName];

      if (this.operation === 'insert') {
        const toInsert = Array.isArray(this.payload) ? this.payload : [this.payload];
        const inserted = toInsert.map((item) => ({
          id: item.id || crypto.randomUUID(),
          ...item,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        table.push(...inserted);

        const result = Array.isArray(this.payload) ? inserted : inserted[0];
        resolve({
          data: this.isSingle ? inserted[0] : (Array.isArray(this.payload) ? inserted : inserted[0]),
          error: null
        });
        return;
      }

      if (this.operation === 'update') {
        const matches = table.filter((row) => this.filters.every((fn) => fn(row)));
        matches.forEach((row) => {
          Object.assign(row, this.payload, { updated_at: new Date().toISOString() });
        });
        resolve({
          data: this.isSingle ? matches[0] || null : matches,
          error: null
        });
        return;
      }

      if (this.operation === 'delete') {
        const beforeLen = table.length;
        const remaining = table.filter((row) => !this.filters.every((fn) => fn(row)));
        mockStorage[this.tableName] = remaining;
        resolve({
          data: null,
          count: beforeLen - remaining.length,
          error: null
        });
        return;
      }

      // SELECT operation
      let result = table.filter((row) => this.filters.every((fn) => fn(row)));
      const totalCount = result.length;

      if (this.orderConfig) {
        const { column, ascending } = this.orderConfig;
        result.sort((a, b) => {
          const valA = a[column];
          const valB = b[column];
          if (valA < valB) return ascending ? -1 : 1;
          if (valA > valB) return ascending ? 1 : -1;
          return 0;
        });
      }

      if (this.rangeConfig) {
        const { from, to } = this.rangeConfig;
        result = result.slice(from, to + 1);
      } else if (this.limitCount) {
        result = result.slice(0, this.limitCount);
      }

      if (this.isSingle) {
        resolve({
          data: result[0] || null,
          error: result[0] ? null : { message: 'Row not found', code: 'PGRST116' }
        });
        return;
      }

      resolve({
        data: result,
        count: totalCount,
        error: null
      });
    } catch (err) {
      resolve({ data: null, error: { message: err.message } });
    }
  }
}

// Client factory
let supabaseClient = null;
const isSupabaseConfigured = Boolean(
  !config.useMockDb &&
  config.supabaseUrl &&
  config.supabaseUrl.startsWith('http') &&
  config.supabaseKey &&
  config.supabaseKey !== 'your-supabase-service-role-key'
);

if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('[Database] Connected to live Supabase PostgreSQL client.');
  } catch (err) {
    console.warn('[Database] Failed to connect to live Supabase, falling back to mock storage:', err.message);
  }
} else {
  console.log('[Database] Running in development mode with resilient memory/mock data store.');
  console.log('[Database] Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env to connect to live Supabase.');
}

/**
 * Supabase client instance or fallback query builder
 */
export const supabase = {
  from(tableName) {
    if (supabaseClient) {
      return supabaseClient.from(tableName);
    }
    return new MockQueryBuilder(tableName);
  },
  isLive: isSupabaseConfigured,
  resetMockData: initMockData
};
