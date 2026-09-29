import { z } from 'zod';

export const createGoalSchema = z.object({
  name: z.string().trim().min(1, 'Goal name is required').max(100),
  target_amount: z.coerce.number().positive('Target amount must be greater than 0'),
  current_amount: z.coerce.number().min(0, 'Current amount cannot be negative').optional().default(0),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be in YYYY-MM-DD format').optional().nullable(),
  description: z.string().trim().max(1000).optional().default('')
});

export const updateGoalSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  target_amount: z.coerce.number().positive().optional(),
  current_amount: z.coerce.number().min(0).optional(),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  description: z.string().trim().max(1000).optional()
});

export const addContributionSchema = z.object({
  amount: z.coerce.number().positive('Contribution amount must be greater than 0')
});
