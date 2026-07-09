import { Request, Response } from 'express';
import * as authService from './auth.service.js';

export async function register(req: Request, res: Response) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    console.error('[Auth Controller] Register error:', err);
    console.error('[Auth Controller] Error type:', typeof err, 'keys:', Object.keys(err || {}));
    const message = typeof err.message === 'string' ? err.message : JSON.stringify(err);
    const status = err.code === 'EMAIL_EXISTS' || err.code === 'EMAIL_CONFIRMATION_REQUIRED' ? 400 : 500;
    res.status(status).json({
      success: false,
      error: { code: err.code || 'REGISTRATION_FAILED', message },
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    const status = err.code === 'INVALID_CREDENTIALS' ? 401 : 500;
    res.status(status).json({
      success: false,
      error: { code: err.code || 'LOGIN_FAILED', message: err.message },
    });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({
      success: true,
      data: { message: 'If the email exists, a password reset link has been sent' },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'RESET_FAILED', message: err.message },
    });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    res.json({ success: true, data: { message: 'Password reset successfully' } });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: { code: 'RESET_FAILED', message: err.message },
    });
  }
}

export async function logout(_req: Request, res: Response) {
  // Supabase handles token invalidation client-side
  res.json({ success: true, data: { message: 'Logged out successfully' } });
}
