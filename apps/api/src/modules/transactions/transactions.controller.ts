import { Request, Response } from 'express';
import * as transactionsService from './transactions.service.js';

export async function list(req: Request, res: Response) {
  try {
    const filters = {
      type: req.query.type as any,
      status: req.query.status as any,
      account_id: req.query.account_id as string | undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };
    const result = await transactionsService.getTransactions(req.user!.id, filters);
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
    const tx = await transactionsService.getTransactionById(req.params.id as string, req.user!.id);
    res.json({ success: true, data: tx });
  } catch (err: any) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: err.message },
    });
  }
}

export async function deposit(req: Request, res: Response) {
  try {
    const tx = await transactionsService.createDeposit(req.user!.id, req.body);
    res.status(201).json({ success: true, data: tx });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: { code: 'DEPOSIT_FAILED', message: err.message },
    });
  }
}

export async function withdraw(req: Request, res: Response) {
  try {
    const tx = await transactionsService.createWithdrawal(req.user!.id, req.body);
    res.status(201).json({ success: true, data: tx });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: { code: 'WITHDRAWAL_FAILED', message: err.message },
    });
  }
}
