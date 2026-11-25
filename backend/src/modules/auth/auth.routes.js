import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from './auth.controller.js';
import { loginSchema, changePasswordSchema } from './auth.validation.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again later.' }
});

router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);
router.get('/me', authenticate, authController.me);
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

export default router;
