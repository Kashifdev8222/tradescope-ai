import { Router } from 'express';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';
import { loginSchema, registerSchema } from '@tradescope/shared-utils';
import * as authController from './auth.controller.js';

export const authRoutes = Router();

authRoutes.post('/register', authLimiter, validate(registerSchema), authController.register);
authRoutes.post('/login', authLimiter, validate(loginSchema), authController.login);
authRoutes.post('/forgot-password', authLimiter, authController.forgotPassword);
authRoutes.post('/reset-password', authLimiter, authController.resetPassword);
authRoutes.post('/logout', authController.logout);
