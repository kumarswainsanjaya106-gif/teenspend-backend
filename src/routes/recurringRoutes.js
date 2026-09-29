import { Router } from 'express';
import { recurringController } from '../controllers/recurringController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createRecurringSchema, updateRecurringSchema } from '../validators/recurringValidator.js';

const router = Router();

router.use(authMiddleware);

router.get('/', recurringController.getRecurring);
router.get('/:id', recurringController.getRecurringById);
router.post('/', validate(createRecurringSchema), recurringController.createRecurring);
router.put('/:id', validate(updateRecurringSchema), recurringController.updateRecurring);
router.delete('/:id', recurringController.deleteRecurring);

export default router;
