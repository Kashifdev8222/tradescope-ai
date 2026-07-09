import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as usersController from './users.controller.js';

export const usersRoutes = Router();

usersRoutes.use(authenticate);

usersRoutes.get('/me', usersController.getMe);
usersRoutes.patch('/me', usersController.updateMe);
usersRoutes.get('/me/settings', usersController.getMySettings);
