import { Request, Response } from 'express';
import * as tradesService from './trades.service.js';

export async function list(req: Request, res: Response) {
  try {
    const filters = {
      status: req.query.status as 'open' | 'closed' | 'all' | undefined,
      symbol: req.query.symbol as string | undefined,
      source: req.query.source as 'manual' | 'ai' | undefined,
      account_id: req.query.account_id as string | undefined,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };
    const result = await tradesService.getTrades(req.user!.id, filters);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: err.message },
    });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const trade = await tradesService.getTradeById(req.params.id as string, req.user!.id);
    res.json({ success: true, data: trade });
  } catch (err: any) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: err.message },
    });
  }
}

export async function place(req: Request, res: Response) {
  try {
    const trade = await tradesService.placeTrade(req.user!.id, req.body);
    res.status(201).json({ success: true, data: trade });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: { code: 'TRADE_FAILED', message: err.message },
    });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const trade = await tradesService.updateTrade(req.params.id as string, req.user!.id, req.body);
    res.json({ success: true, data: trade });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: err.message },
    });
  }
}

export async function close(req: Request, res: Response) {
  try {
    const trade = await tradesService.closeTrade(req.params.id as string, req.user!.id, req.body.exit_price);
    res.json({ success: true, data: trade });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: { code: 'CLOSE_FAILED', message: err.message },
    });
  }
}
