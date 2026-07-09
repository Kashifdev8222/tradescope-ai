import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { tradeSchema } from '@tradescope/shared-utils';
import * as tradesController from './trades.controller.js';

export const tradesRoutes = Router();

tradesRoutes.use(authenticate);

tradesRoutes.get('/', tradesController.list);
tradesRoutes.get('/:id', tradesController.getById);
tradesRoutes.post('/', validate(tradeSchema), tradesController.place);
tradesRoutes.patch('/:id', tradesController.update);
tradesRoutes.post('/:id/close', tradesController.close);
