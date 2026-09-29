import { Router } from 'express';
import { expenseController } from '../controllers/expenseController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createExpenseSchema, updateExpenseSchema, expenseQuerySchema } from '../validators/expenseValidator.js';

const router = Router();

// Protect all expense routes
router.use(authMiddleware);

router.get('/', validate(expenseQuerySchema, 'query'), expenseController.getExpenses);
router.get('/:id', expenseController.getExpenseById);
router.post('/', validate(createExpenseSchema), expenseController.createExpense);
router.put('/:id', validate(updateExpenseSchema), expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

export default router;
