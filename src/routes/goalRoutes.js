import { Router } from 'express';
import { goalController } from '../controllers/goalController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createGoalSchema, updateGoalSchema, addContributionSchema } from '../validators/goalValidator.js';

const router = Router();

router.use(authMiddleware);

router.get('/', goalController.getGoals);
router.get('/:id', goalController.getGoalById);
router.post('/', validate(createGoalSchema), goalController.createGoal);
router.put('/:id', validate(updateGoalSchema), goalController.updateGoal);
router.post('/:id/contribute', validate(addContributionSchema), goalController.addContribution);
router.delete('/:id', goalController.deleteGoal);

export default router;
