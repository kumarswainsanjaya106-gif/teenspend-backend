import { Router } from 'express';
import { incomeController } from '../controllers/incomeController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createIncomeSchema, updateIncomeSchema } from '../validators/incomeValidator.js';

const router = Router();

router.use(authMiddleware);

router.get('/', incomeController.getIncome);
router.get('/:id', incomeController.getIncomeById);
router.post('/', validate(createIncomeSchema), incomeController.createIncome);
router.put('/:id', validate(updateIncomeSchema), incomeController.updateIncome);
router.delete('/:id', incomeController.deleteIncome);

export default router;
