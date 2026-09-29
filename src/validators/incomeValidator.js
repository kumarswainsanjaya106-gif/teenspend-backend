import { z } from 'zod';

export const createIncomeSchema = z.object({
  amount: z.coerce.number().positive('Income amount must be greater than 0'),
  source: z.string().trim().min(1, 'Source is required').max(100, 'Source is too long'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional().default(() => new Date().toISOString().split('T')[0]),
  notes: z.string().trim().max(1000).optional().default('')
});

export const updateIncomeSchema = z.object({
  amount: z.coerce.number().positive('Income amount must be greater than 0').optional(),
  source: z.string().trim().min(1, 'Source is required').max(100).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  notes: z.string().trim().max(1000).optional()
});
