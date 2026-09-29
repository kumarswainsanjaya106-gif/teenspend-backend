import { Router } from 'express';
import { insightController } from '../controllers/insightController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', insightController.getInsights);

export default router;
