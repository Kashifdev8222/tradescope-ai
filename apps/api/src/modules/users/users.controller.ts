import { Request, Response } from 'express';
import * as usersService from './users.service.js';

export async function getMe(req: Request, res: Response) {
  try {
    const profile = await usersService.getProfile(req.user!.id);
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: err.message },
    });
  }
}

export async function updateMe(req: Request, res: Response) {
  try {
    const profile = await usersService.updateProfile(req.user!.id, req.body);
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: err.message },
    });
  }
}

export async function getMySettings(req: Request, res: Response) {
  try {
    const settings = await usersService.getUserSettings(req.user!.id);
    res.json({ success: true, data: settings });
  } catch (err: any) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: err.message },
    });
  }
}
