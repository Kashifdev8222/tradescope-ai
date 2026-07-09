import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as aiController from './ai.controller.js';

export const aiRoutes = Router();

aiRoutes.use(authenticate);

aiRoutes.get('/signals', aiController.listSignals);
aiRoutes.get('/signals/:id', aiController.getSignal);
aiRoutes.get('/settings', aiController.getSettings);
aiRoutes.patch('/settings', aiController.updateSettings);
aiRoutes.post('/analyze', aiController.analyze);
