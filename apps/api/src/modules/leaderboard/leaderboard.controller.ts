import { Request, Response } from 'express';
import * as leaderboardService from './leaderboard.service.js';

export async function getLeaderboard(req: Request, res: Response) {
  try {
    const sortBy = (req.query.sortBy as 'profit' | 'winRate' | 'trades') || 'profit';
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 1;

    const result = await leaderboardService.getLeaderboard({ sortBy, limit, page });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: err.message },
    });
  }
}

export async function getActivity(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const activities = await leaderboardService.getActivityFeed(limit);
    res.json({ success: true, data: activities });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: err.message },
    });
  }
}

export async function getTrader(req: Request, res: Response) {
  try {
    const trader = await leaderboardService.getTraderById(req.params.traderId as string);
    res.json({ success: true, data: trader });
  } catch (err: any) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: err.message },
    });
  }
}
