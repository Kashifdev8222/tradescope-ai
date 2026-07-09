import { Request, Response } from 'express';
import * as newsService from './news.service.js';

export async function list(req: Request, res: Response) {
  try {
    const source = req.query.source as string | undefined;
    const limit = parseInt(req.query.limit as string) || 20;
    const articles = await newsService.getNewsFeed(source, limit);
    res.json({ success: true, data: articles });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: err.message },
    });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const article = await newsService.getNewsById(req.params.id as string);
    res.json({ success: true, data: article });
  } catch (err: any) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: err.message },
    });
  }
}
