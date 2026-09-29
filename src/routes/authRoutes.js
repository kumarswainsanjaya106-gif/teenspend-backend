import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/authValidator.js';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.getMe);
router.put('/profile', authMiddleware, validate(updateProfileSchema), authController.updateProfile);

export default router;
