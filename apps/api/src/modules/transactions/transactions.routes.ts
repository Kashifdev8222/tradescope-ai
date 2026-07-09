import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { depositSchema, withdrawalSchema } from '@tradescope/shared-utils';
import * as transactionsController from './transactions.controller.js';

export const transactionsRoutes = Router();

transactionsRoutes.use(authenticate);

transactionsRoutes.get('/', transactionsController.list);
transactionsRoutes.get('/:id', transactionsController.getById);
transactionsRoutes.post('/deposit', validate(depositSchema), transactionsController.deposit);
transactionsRoutes.post('/withdrawal', validate(withdrawalSchema), transactionsController.withdraw);
