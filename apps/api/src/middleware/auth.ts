import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import type { AuthUser } from '@tradescope/shared-types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' },
    });
    return;
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Token is invalid or expired' },
      });
      return;
    }

    // Fetch profile for role and active status
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, is_active, ai_enabled')
      .eq('id', data.user.id)
      .single();

    if (!profile) {
      res.status(401).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'User profile not found' },
      });
      return;
    }

    if (!profile.is_active) {
      res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account has been suspended' },
      });
      return;
    }

    req.user = {
      id: data.user.id,
      email: data.user.email!,
      role: profile.role,
      is_active: profile.is_active,
    };

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'AUTH_ERROR', message: 'Authentication failed' },
    });
  }
}
