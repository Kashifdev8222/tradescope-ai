import { Request, Response } from 'express';
import * as aiService from './ai.service.js';

export async function listSignals(req: Request, res: Response) {
  try {
    const filters = {
      status: req.query.status as string | undefined,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };
    const result = await aiService.getSignals(req.user!.id, filters);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: err.message },
    });
  }
}

export async function getSignal(req: Request, res: Response) {
  try {
    const signal = await aiService.getSignalById(req.params.id as string, req.user!.id);
    res.json({ success: true, data: signal });
  } catch (err: any) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: err.message },
    });
  }
}

export async function getSettings(req: Request, res: Response) {
  try {
    const settings = await aiService.getSettings(req.user!.id);
    res.json({ success: true, data: settings });
  } catch (err: any) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: err.message },
    });
  }
}

export async function updateSettings(req: Request, res: Response) {
  try {
    const settings = await aiService.updateSettings(req.user!.id, req.body);
    res.json({ success: true, data: settings });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: err.message },
    });
  }
}

export async function analyze(req: Request, res: Response) {
  try {
    const { symbol, account_id } = req.body;
    const analysis = await aiService.requestAnalysis(req.user!.id, symbol, account_id);
    res.json({ success: true, data: analysis });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: { code: 'ANALYSIS_FAILED', message: err.message },
    });
  }
}
