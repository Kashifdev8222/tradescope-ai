import { Request, Response } from 'express';
import * as adminService from './admin.service.js';
import { supabaseAdmin } from '../../config/supabase.js';

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

// --- RBAC ---
export async function listRoles(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin.from('roles').select('*, permissions:role_permissions(permission_id)').order('created_at');
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: err.message } });
  }
}

export async function listPermissions(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin.from('permissions').select('*').order('category').order('name');
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: err.message } });
  }
}

export async function addPermission(req: Request, res: Response) {
  try {
    const { roleId } = req.params;
    const { permission_id } = req.body;
    const { error } = await supabaseAdmin.from('role_permissions').insert({ role_id: roleId, permission_id });
    if (error) throw error;
    res.json({ success: true, data: { message: 'Permission added' } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'ADD_FAILED', message: err.message } });
  }
}

export async function removePermission(req: Request, res: Response) {
  try {
    const { roleId, permId } = req.params;
    const { error } = await supabaseAdmin.from('role_permissions').delete().eq('role_id', roleId).eq('permission_id', permId);
    if (error) throw error;
    res.json({ success: true, data: { message: 'Permission removed' } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'REMOVE_FAILED', message: err.message } });
  }
}

// --- CRM ---
export async function listClients(req: Request, res: Response) {
  try {
    const { search, status, page = '1', limit = '30' } = req.query;
    const from = (parseInt(page as string) - 1) * parseInt(limit as string);
    const to = from + parseInt(limit as string) - 1;
    
    let query = supabaseAdmin.from('clients').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
    if (search) query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    if (status) query = query.eq('status', status);
    
    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ success: true, data: data || [], meta: { page: parseInt(page as string), limit: parseInt(limit as string), total: count || 0 } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: err.message } });
  }
}

export async function createClient(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin.from('clients').insert(req.body).select('*').single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_FAILED', message: err.message } });
  }
}

export async function updateClient(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin.from('clients').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id as string).select('*').single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: err.message } });
  }
}

export async function getClient(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin.from('clients').select('*').eq('id', req.params.id as string).single();
    if (error || !data) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Client not found' } }); return; }
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: err.message } });
  }
}

export async function deleteClient(req: Request, res: Response) {
  try {
    const { error } = await supabaseAdmin.from('clients').delete().eq('id', req.params.id as string);
    if (error) throw error;
    res.json({ success: true, data: { message: 'Client deleted' } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'DELETE_FAILED', message: err.message } });
  }
}

export async function importClients(req: Request, res: Response) {
  try {
    const { records } = req.body;
    if (!records || !Array.isArray(records)) {
      res.status(400).json({ success: false, error: { code: 'INVALID_DATA', message: 'records array required' } });
      return;
    }
    const batch = records.map((r: any) => ({ ...r, created_at: new Date().toISOString() }));
    const { error } = await supabaseAdmin.from('clients').insert(batch);
    if (error) throw error;
    res.json({ success: true, data: { imported: batch.length } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'IMPORT_FAILED', message: err.message } });
  }
}

// --- Agent Workspace ---

export async function listAgentTasks(req: Request, res: Response) {
  try {
    const { status, priority, assigned_to, page = '1', limit = '50' } = req.query;
    let query = supabaseAdmin.from('agent_tasks').select('*, clients:client_id(first_name,last_name,email,phone)', { count: 'exact' }).order('scheduled_for', { ascending: true, nullsFirst: false });
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (assigned_to) query = query.eq('assigned_to', assigned_to);
    const from = (parseInt(page as string) - 1) * parseInt(limit as string);
    const to = from + parseInt(limit as string) - 1;
    const { data, error, count } = await query.range(from, to);
    if (error) throw error;
    res.json({ success: true, data: data || [], meta: { page: parseInt(page as string), limit: parseInt(limit as string), total: count || 0 } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: err.message } });
  }
}

export async function createAgentTask(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin.from('agent_tasks').insert({ ...req.body, created_at: new Date().toISOString() }).select('*').single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_FAILED', message: err.message } });
  }
}

export async function updateAgentTask(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin.from('agent_tasks').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select('*').single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: err.message } });
  }
}

export async function deleteAgentTask(req: Request, res: Response) {
  try {
    const { error } = await supabaseAdmin.from('agent_tasks').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, data: { message: 'Task deleted' } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'DELETE_FAILED', message: err.message } });
  }
}

export async function getAgentStats(_req: Request, res: Response) {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const [pending, todayDone, urgent, clients] = await Promise.all([
      supabaseAdmin.from('agent_tasks').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('agent_tasks').select('*', { count: 'exact', head: true }).eq('status', 'completed').gte('completed_at', today.toISOString()),
      supabaseAdmin.from('agent_tasks').select('*', { count: 'exact', head: true }).eq('priority', 'urgent').neq('status', 'completed'),
      supabaseAdmin.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'lead'),
    ]);
    res.json({ success: true, data: {
      pending_tasks: pending.count || 0,
      completed_today: todayDone.count || 0,
      urgent_pending: urgent.count || 0,
      total_leads: clients.count || 0,
    }});
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: err.message } });
  }
}

// --- Reports ---

export async function getFunnelReport(_req: Request, res: Response) {
  try {
    const [leads, clients, inactive, blocked] = await Promise.all([
      supabaseAdmin.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'lead'),
      supabaseAdmin.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'client'),
      supabaseAdmin.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'inactive'),
      supabaseAdmin.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'blocked'),
    ]);

    // Monthly conversion data (last 6 months)
    const months: { month: string; leads: number; clients: number; conversion: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();
      const monthLabel = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });

      const [{ count: leadsCount }, { count: clientsCount }] = await Promise.all([
        supabaseAdmin.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'lead').gte('created_at', start).lte('created_at', end),
        supabaseAdmin.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'client').gte('created_at', start).lte('created_at', end),
      ]);
      const total = (leadsCount || 0) + (clientsCount || 0);
      months.push({ month: monthLabel, leads: leadsCount || 0, clients: clientsCount || 0, conversion: total > 0 ? Math.round((clientsCount || 0) / total * 100) : 0 });
    }

    res.json({ success: true, data: {
      summary: {
        total_leads: leads.count || 0,
        total_clients: clients.count || 0,
        inactive: inactive.count || 0,
        blocked: blocked.count || 0,
        conversion_rate: ((leads.count || 0) + (clients.count || 0)) > 0 ? Math.round(((clients.count || 0) / ((leads.count || 0) + (clients.count || 0))) * 100) : 0,
      },
      monthly: months,
    }});
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: err.message } });
  }
}

export async function getKPIReport(_req: Request, res: Response) {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: aiUsers },
      { data: balances },
      { count: todayTrades },
      { count: pendingWithdrawals },
      { count: totalTrades },
      { data: topTraders },
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('ai_enabled', true),
      supabaseAdmin.from('trading_accounts').select('balance,equity,margin_used'),
      supabaseAdmin.from('trades').select('*', { count: 'exact', head: true }).gte('opened_at', today.toISOString()),
      supabaseAdmin.from('transactions').select('*', { count: 'exact', head: true }).eq('type', 'withdrawal').eq('status', 'pending'),
      supabaseAdmin.from('trades').select('*', { count: 'exact', head: true }).gte('opened_at', thisMonth.toISOString()),
      supabaseAdmin.from('leaderboard_entries').select('trader_id,total_profit,win_rate').order('total_profit', { ascending: false }).limit(5),
    ]);

    const totalAUM = (balances || []).reduce((s: number, a: any) => s + Number(a.equity || 0), 0);
    const totalMargin = (balances || []).reduce((s: number, a: any) => s + Number(a.margin_used || 0), 0);

    res.json({ success: true, data: {
      users: { total: totalUsers || 0, active: activeUsers || 0, ai_enabled: aiUsers || 0 },
      financial: { total_aum: totalAUM, total_margin: totalMargin, pending_withdrawals: pendingWithdrawals || 0 },
      trading: { today_trades: todayTrades || 0, month_trades: totalTrades || 0 },
      top_traders: topTraders || [],
    }});
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: err.message } });
  }
}

// --- Duplicate Detection ---

export async function checkDuplicate(req: Request, res: Response) {
  try {
    const { first_name, last_name, email, phone } = req.body;
    const matches: any[] = [];

    if (email) {
      const { data } = await supabaseAdmin.from('clients').select('*').eq('email', email);
      if (data?.length) matches.push(...data.map((d: any) => ({ ...d, match_by: 'email' })));
    }
    if (phone && matches.length === 0) {
      const { data } = await supabaseAdmin.from('clients').select('*').eq('phone', phone);
      if (data?.length) matches.push(...data.map((d: any) => ({ ...d, match_by: 'phone' })));
    }
    if (first_name && last_name && matches.length === 0) {
      const { data } = await supabaseAdmin.from('clients').select('*').eq('first_name', first_name).eq('last_name', last_name);
      if (data?.length) matches.push(...data.map((d: any) => ({ ...d, match_by: 'name' })));
    }

    res.json({ success: true, data: { duplicates: matches } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'CHECK_FAILED', message: err.message } });
  }
}
