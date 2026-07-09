import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

// Cache role permissions for 5 minutes
const cache = new Map<string, { perms: Set<string>; expires: number }>();

async function getUserPermissions(userId: string): Promise<Set<string>> {
  const cached = cache.get(userId);
  if (cached && cached.expires > Date.now()) return cached.perms;

  // Owner bypasses all checks
  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', userId).single();
  if (profile?.role === 'admin') {
    // Admin gets all permissions (we check role first for backward compatibility)
    const perms = new Set<string>();
    cache.set(userId, { perms, expires: Date.now() + 300000 });
    return perms;
  }

  // Check if user has a role_id assigned
  const { data: roleData } = await supabaseAdmin.from('profiles').select('role_id').eq('id', userId).single();

  if (!roleData?.role_id) {
    const perms = new Set<string>();
    cache.set(userId, { perms, expires: Date.now() + 300000 });
    return perms;
  }

  // Get permissions for the role
  const { data: perms } = await supabaseAdmin
    .from('role_permissions')
    .select('permission_id, permissions!inner(slug)')
    .eq('role_id', roleData.role_id);

  const permSet = new Set((perms || []).map((p: any) => p.permissions?.slug).filter(Boolean));
  cache.set(userId, { perms: permSet, expires: Date.now() + 300000 });
  return permSet;
}

export function requirePermission(slug: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    try {
      // Owner bypasses all permission checks
      if (req.user.role === 'admin') {
        // Legacy admin role has all permissions
        next(); return;
      }

      const permissions = await getUserPermissions(req.user.id);
      if (!permissions.has(slug)) {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: `Missing permission: ${slug}` },
        });
        return;
      }
      next();
    } catch (err) {
      res.status(500).json({ success: false, error: { code: 'PERMISSION_CHECK_FAILED', message: 'Failed to verify permissions' } });
    }
  };
}
