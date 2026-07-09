import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as leaderboardController from './leaderboard.controller.js';

export const leaderboardRoutes = Router();

leaderboardRoutes.use(authenticate);

leaderboardRoutes.get('/', leaderboardController.getLeaderboard);
leaderboardRoutes.get('/activity', leaderboardController.getActivity);
leaderboardRoutes.get('/:traderId', leaderboardController.getTrader);
