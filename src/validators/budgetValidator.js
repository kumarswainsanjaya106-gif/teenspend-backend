import { z } from 'zod';

export const createBudgetSchema = z.object({
  category: z.string().trim().min(1, 'Category is required'),
  amount: z.coerce.number().positive('Budget amount must be greater than 0'),
  month: z.coerce.number().int().min(1).max(12).optional().default(() => new Date().getMonth() + 1),
  year: z.coerce.number().int().min(2020).max(2100).optional().default(() => new Date().getFullYear())
});

export const updateBudgetSchema = z.object({
  amount: z.coerce.number().positive('Budget amount must be greater than 0').optional(),
  category: z.string().trim().min(1).optional()
});
