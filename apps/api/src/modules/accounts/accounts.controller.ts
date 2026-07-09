import { Request, Response } from 'express';
import * as accountsService from './accounts.service.js';

export async function list(req: Request, res: Response) {
  try {
    const accounts = await accountsService.getAccounts(req.user!.id);
    res.json({ success: true, data: accounts });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: err.message },
    });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const account = await accountsService.getAccountById(req.params.id as string, req.user!.id);
    res.json({ success: true, data: account });
  } catch (err: any) {
    const status = err.message === 'Account not found' ? 404 : 500;
    res.status(status).json({
      success: false,
      error: { code: status === 404 ? 'NOT_FOUND' : 'FETCH_FAILED', message: err.message },
    });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const account = await accountsService.createAccount(req.user!.id, req.body);
    res.status(201).json({ success: true, data: account });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: { code: 'CREATE_FAILED', message: err.message },
    });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const account = await accountsService.updateAccount(req.params.id as string, req.user!.id, req.body);
    res.json({ success: true, data: account });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: err.message },
    });
  }
}

export async function getPortfolioSummary(req: Request, res: Response) {
  try {
    const summary = await accountsService.getPortfolioSummary(req.user!.id);
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: err.message },
    });
  }
}
