import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as newsController from './news.controller.js';

export const newsRoutes = Router();

newsRoutes.use(authenticate);

newsRoutes.get('/', newsController.list);
newsRoutes.get('/:id', newsController.getById);
