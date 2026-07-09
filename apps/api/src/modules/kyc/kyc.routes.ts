import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/requireAdmin.js';
import * as ctrl from './kyc.controller.js';

export const kycRoutes = Router();

// Client routes
kycRoutes.post('/upload', authenticate, ctrl.upload);
kycRoutes.get('/my', authenticate, ctrl.listMy);
kycRoutes.delete('/:id', authenticate, ctrl.deleteDoc);

// Admin routes
kycRoutes.get('/all', authenticate, requireAdmin, ctrl.listAll);
kycRoutes.patch('/:id/review', authenticate, requireAdmin, ctrl.review);
