import { Request, Response } from 'express';
import * as adminService from './admin.service.js';

// --- User Management ---

export async function listUsers(req: Request, res: Response) {
  try {
    const filters = {
      search: req.query.search as string | undefined,
      status: req.query.status as 'active' | 'suspended' | undefined,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };
    const result = await adminService.listUsers(filters);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: err.message } });
  }
}

export async function getUserDetail(req: Request, res: Response) {
  try {
    const detail = await adminService.getUserDetail(req.params.id as string);
    res.json({ success: true, data: detail });
  } catch (err: any) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: err.message } });
  }
}

export async function updateUserStatus(req: Request, res: Response) {
  try {
    const user = await adminService.updateUserStatus(req.params.id as string, req.user!.id, req.body);
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: err.message } });
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const result = await adminService.createUser(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_FAILED', message: err.message } });
  }
}

export async function toggleUserAI(req: Request, res: Response) {
  try {
    const user = await adminService.toggleUserAI(req.params.id as string, req.user!.id);
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: err.message } });
  }
}

// --- Balance Control ---

export async function getBalancesSummary(req: Request, res: Response) {
  try {
    const summary = await adminService.getPlatformBalances();
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: err.message } });
  }
}

export async function getAccountBalance(req: Request, res: Response) {
  try {
    const balance = await adminService.getAccountDetail(req.params.id as string);
    res.json({ success: true, data: balance });
  } catch (err: any) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: err.message } });
  }
}

export async function adjustBalance(req: Request, res: Response) {
  try {
    const result = await adminService.adjustBalance(req.params.id as string, req.user!.id, req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'ADJUST_FAILED', message: err.message } });
  }
}

// --- Transaction Oversight ---

export async function listAllTransactions(req: Request, res: Response) {
  try {
    const filters = {
      type: req.query.type as any,
      status: req.query.status as any,
      userId: req.query.userId as string | undefined,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };
    const result = await adminService.listAllTransactions(filters);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: err.message } });
  }
}

export async function approveTransaction(req: Request, res: Response) {
  try {
    const tx = await adminService.approveTransaction(req.params.id as string, req.user!.id);
    res.json({ success: true, data: tx });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'APPROVE_FAILED', message: err.message } });
  }
}

export async function rejectTransaction(req: Request, res: Response) {
  try {
    const tx = await adminService.rejectTransaction(req.params.id as string, req.user!.id);
    res.json({ success: true, data: tx });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'REJECT_FAILED', message: err.message } });
  }
}

export async function exportTransactionsCSV(req: Request, res: Response) {
  try {
    const csv = await adminService.exportCSV(req.query as any);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'EXPORT_FAILED', message: err.message } });
  }
}

// --- AI Control ---

export async function getAIParams(_req: Request, res: Response) {
  try {
    const params = await adminService.getAIGlobalParams();
    res.json({ success: true, data: params });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: err.message } });
  }
}

export async function updateAIParams(req: Request, res: Response) {
  try {
    const params = await adminService.updateAIGlobalParams(req.user!.id, req.body);
    res.json({ success: true, data: params });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: err.message } });
  }
}

export async function listAIOverrides(_req: Request, res: Response) {
  try {
    const overrides = await adminService.listAIOverrides();
    res.json({ success: true, data: overrides });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: err.message } });
  }
}

export async function setAIOverride(req: Request, res: Response) {
  try {
    const override = await adminService.setAIOverride(req.params.userId as string, req.user!.id, req.body);
    res.json({ success: true, data: override });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'OVERRIDE_FAILED', message: err.message } });
  }
}

export async function removeAIOverride(req: Request, res: Response) {
  try {
    await adminService.removeAIOverride(req.params.userId as string);
    res.json({ success: true, data: { message: 'Override removed' } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'REMOVE_FAILED', message: err.message } });
  }
}

export async function emergencyStop(req: Request, res: Response) {
  try {
    await adminService.emergencyStop(req.user!.id);
    res.json({ success: true, data: { message: 'AI trading stopped globally' } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'EMERGENCY_FAILED', message: err.message } });
  }
}

export async function emergencyResume(req: Request, res: Response) {
  try {
    await adminService.emergencyResume(req.user!.id);
    res.json({ success: true, data: { message: 'AI trading resumed' } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'RESUME_FAILED', message: err.message } });
  }
}

export async function getAIStats(_req: Request, res: Response) {
  try {
    const stats = await adminService.getAIStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: err.message } });
  }
}

// --- Audit ---

export async function getAuditLog(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const result = await adminService.getAuditLog(page, limit);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: err.message } });
  }
}
