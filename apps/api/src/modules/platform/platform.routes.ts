import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/requireAdmin.js';
import * as platformController from './platform.controller.js';

export const platformRoutes = Router();

platformRoutes.use(authenticate);
platformRoutes.use(requireAdmin);

platformRoutes.get('/', platformController.getAll);
platformRoutes.get('/:key', platformController.getByKey);
platformRoutes.patch('/:key', platformController.update);
