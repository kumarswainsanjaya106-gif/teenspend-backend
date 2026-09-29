import { z } from 'zod';

export const EXPENSE_CATEGORIES = [
  'Food',
  'Snacks',
  'Transport',
  'Entertainment',
  'Gaming',
  'Shopping',
  'School',
  'Subscriptions',
  'Sports',
  'Hobbies',
  'Gifts',
  'Other'
];

export const PAYMENT_METHODS = [
  'Cash',
  'Debit Card',
  'Bank Transfer',
  'Digital Wallet',
  'Other'
];

export const createExpenseSchema = z.object({
  amount: z.coerce.number().positive('Expense amount must be greater than 0'),
  category: z.string().trim().min(1, 'Category is required'),
  description: z.string().trim().min(1, 'Description is required').max(255, 'Description is too long'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional().default(() => new Date().toISOString().split('T')[0]),
  payment_method: z.string().trim().default('Cash'),
  notes: z.string().trim().max(1000).optional().default('')
});

export const updateExpenseSchema = z.object({
  amount: z.coerce.number().positive('Expense amount must be greater than 0').optional(),
  category: z.string().trim().min(1, 'Category is required').optional(),
  description: z.string().trim().min(1, 'Description is required').max(255).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  payment_method: z.string().trim().optional(),
  notes: z.string().trim().max(1000).optional()
});

export const expenseQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  category: z.string().trim().optional(),
  payment_method: z.string().trim().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(['date', 'amount', 'category', 'created_at']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});
