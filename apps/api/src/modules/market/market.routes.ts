import { Router } from 'express';
import { marketLimiter } from '../../middleware/rateLimiter.js';
import * as marketController from './market.controller.js';

export const marketRoutes = Router();

// Market data needs high-frequency polling — use generous limiter
marketRoutes.use(marketLimiter);
marketRoutes.get('/quotes', marketController.getQuotes);
marketRoutes.get('/candles', marketController.getCandles);
marketRoutes.get('/symbols', marketController.getSymbols);
