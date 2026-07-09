import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as accountsController from './accounts.controller.js';

export const accountsRoutes = Router();

accountsRoutes.use(authenticate);

accountsRoutes.get('/', accountsController.list);
accountsRoutes.get('/:id', accountsController.getById);
accountsRoutes.post('/', accountsController.create);
accountsRoutes.patch('/:id', accountsController.update);
accountsRoutes.get('/summary/portfolio', accountsController.getPortfolioSummary);
