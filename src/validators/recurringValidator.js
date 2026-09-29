import { z } from 'zod';

export const RECURRING_FREQUENCIES = ['Weekly', 'Monthly', 'Yearly'];

export const createRecurringSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  frequency: z.enum(['Weekly', 'Monthly', 'Yearly']),
  next_payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  category: z.string().trim().default('Subscriptions'),
  is_active: z.boolean().optional().default(true)
});

export const updateRecurringSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  amount: z.coerce.number().positive().optional(),
  frequency: z.enum(['Weekly', 'Monthly', 'Yearly']).optional(),
  next_payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  category: z.string().trim().optional(),
  is_active: z.boolean().optional()
});
