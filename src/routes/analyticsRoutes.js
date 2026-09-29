import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', analyticsController.getDashboard);
router.get('/summary', analyticsController.getSummary);
router.get('/category', analyticsController.getCategory);
router.get('/monthly', analyticsController.getMonthly);
router.get('/trends', analyticsController.getTrends);

export default router;
