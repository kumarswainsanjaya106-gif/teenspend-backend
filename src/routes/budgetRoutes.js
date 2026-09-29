import { Router } from 'express';
import { budgetController } from '../controllers/budgetController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createBudgetSchema, updateBudgetSchema } from '../validators/budgetValidator.js';

const router = Router();

router.use(authMiddleware);

router.get('/', budgetController.getBudgets);
router.get('/:id', budgetController.getBudgetById);
router.post('/', validate(createBudgetSchema), budgetController.createBudget);
router.put('/:id', validate(updateBudgetSchema), budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

export default router;
