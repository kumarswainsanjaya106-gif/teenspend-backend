import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password is too long'),
  age: z.coerce.number().int().min(10, 'Age must be at least 10').max(25, 'Age cannot exceed 25'),
  currency: z.string().trim().max(5, 'Currency code too long').default('USD'),
  monthly_income: z.coerce.number().min(0, 'Income must be non-negative').optional().default(0),
  savings_goal: z.coerce.number().min(0, 'Savings goal must be non-negative').optional().default(0)
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
  age: z.coerce.number().int().min(10, 'Age must be at least 10').max(25, 'Age cannot exceed 25').optional(),
  currency: z.string().trim().max(5).optional(),
  monthly_income: z.coerce.number().min(0, 'Income must be non-negative').optional(),
  savings_goal: z.coerce.number().min(0, 'Savings goal must be non-negative').optional()
});
