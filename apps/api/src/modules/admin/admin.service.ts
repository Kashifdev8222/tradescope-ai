import { supabaseAdmin, supabaseAuth } from '../../config/supabase.js';
import { getPagination, getPaginationMeta } from '@tradescope/shared-utils';
import type { UserProfile, TradingAccount, Transaction, AIGlobalParams, UserAIOverride } from '@tradescope/shared-types';

// --- User Management ---

export async function listUsers(filters: {
  search?: string;
  status?: 'active' | 'suspended';
  page: number;
  limit: number;
}) {
  const { page, limit, offset } = getPagination(filters);

  let query = supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.search) {
    query = query.or(`email.ilike.%${filters.search}%,display_name.ilike.%${filters.search}%`);
  }
  if (filters.status === 'active') {
    query = query.eq('is_active', true);
  } else if (filters.status === 'suspended') {
    query = query.eq('is_active', false);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { data: data || [], meta: getPaginationMeta(count || 0, page, limit) };
}

export async function getUserDetail(userId: string) {
  const [profile, accounts, trades] = await Promise.all([
    supabaseAdmin.from('profiles').select('*').eq('id', userId).single(),
    supabaseAdmin.from('trading_accounts').select('*').eq('user_id', userId),
    supabaseAdmin.from('trades').select('*').eq('user_id', userId).order('opened_at', { ascending: false }).limit(20),
  ]);

  if (profile.error || !profile.data) throw new Error('User not found');

  return {
    profile: profile.data,
    accounts: accounts.data || [],
    recent_trades: trades.data || [],
  };
}

export async function updateUserStatus(userId: string, adminId: string, body: { is_active: boolean }) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ is_active: body.is_active, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('*')
    .single();

  if (error || !data) throw new Error('Failed to update user status');

  // Log admin action
  await supabaseAdmin.from('admin_actions').insert({
    admin_id: adminId,
    action_type: body.is_active ? 'user_activate' : 'user_suspend',
    target_user_id: userId,
    details: { is_active: body.is_active },
  });

  return data;
}

export async function createUser(body: { email: string; password: string; display_name?: string; role?: string }) {
  const { data, error } = await supabaseAuth.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: { display_name: body.display_name || body.email.split('@')[0] },
  });

  if (error) throw error;

  // Update role if specified
  if (body.role === 'admin') {
    await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', data.user!.id);
  }

  return { user: data.user };
}

export async function toggleUserAI(userId: string, adminId: string) {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('ai_enabled')
    .eq('id', userId)
    .single();

  const newAiEnabled = !profile?.ai_enabled;

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ ai_enabled: newAiEnabled, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('*')
    .single();

  if (error || !data) throw new Error('Failed to toggle AI');

  await supabaseAdmin.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'user_ai_toggle',
    target_user_id: userId,
    details: { ai_enabled: newAiEnabled },
  });

  return data;
}

// --- Balance Control ---

export async function getPlatformBalances() {
  const { data: accounts, error } = await supabaseAdmin
    .from('trading_accounts')
    .select('*');

  if (error) throw error;

  const accountsList = accounts || [];
  const totalAUM = accountsList.reduce((sum, a) => sum + Number(a.equity), 0);
  const totalBalance = accountsList.reduce((sum, a) => sum + Number(a.balance), 0);
  const totalMargin = accountsList.reduce((sum, a) => sum + Number(a.margin_used), 0);
  const activeAccounts = accountsList.filter((a) => a.is_active).length;

  // Count pending withdrawals
  const { count: pendingCount } = await supabaseAdmin
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'withdrawal')
    .eq('status', 'pending');

  return {
    total_aum: totalAUM,
    total_balance: totalBalance,
    total_margin: totalMargin,
    active_accounts: activeAccounts,
    total_accounts: accountsList.length,
    pending_withdrawals: pendingCount || 0,
    margin_utilization_pct: totalAUM > 0 ? (totalMargin / totalAUM) * 100 : 0,
  };
}

export async function getAccountDetail(accountId: string): Promise<TradingAccount> {
  const { data, error } = await supabaseAdmin
    .from('trading_accounts')
    .select('*')
    .eq('id', accountId)
    .single();

  if (error || !data) throw new Error('Account not found');
  return data;
}

export async function adjustBalance(accountId: string, adminId: string, body: { amount: number; reason: string }) {
  const { data: account } = await supabaseAdmin
    .from('trading_accounts')
    .select('balance, equity')
    .eq('id', accountId)
    .single();

  if (!account) throw new Error('Account not found');

  const newBalance = Number(account.balance) + body.amount;

  const { data, error } = await supabaseAdmin
    .from('trading_accounts')
    .update({
      balance: newBalance,
      equity: Number(account.equity) + body.amount,
      buying_power: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq('id', accountId)
    .select('*')
    .single();

  if (error || !data) throw new Error('Failed to adjust balance');

  // Log as transaction + admin action
  await supabaseAdmin.from('transactions').insert({
    account_id: accountId,
    user_id: data.user_id,
    type: 'adjustment',
    status: 'completed',
    amount: body.amount,
    description: body.reason,
    completed_at: new Date().toISOString(),
  });

  await supabaseAdmin.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'balance_adjust',
    target_user_id: data.user_id,
    details: { account_id: accountId, amount: body.amount, reason: body.reason },
  });

  return data;
}

// --- Transaction Oversight ---

export async function listAllTransactions(filters: {
  type?: string;
  status?: string;
  userId?: string;
  page: number;
  limit: number;
}) {
  const { page, limit, offset } = getPagination(filters);

  let query = supabaseAdmin
    .from('transactions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.type) query = query.eq('type', filters.type);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.userId) query = query.eq('user_id', filters.userId);

  const { data, error, count } = await query;
  if (error) throw error;

  return { data: data || [], meta: getPaginationMeta(count || 0, page, limit) };
}

export async function approveTransaction(txId: string, adminId: string) {
  const { data: tx } = await supabaseAdmin.from('transactions').select('*').eq('id', txId).single();
  if (!tx) throw new Error('Transaction not found');
  if (tx.status !== 'pending') throw new Error('Transaction is not pending');

  // For withdrawals, the balance was already deducted — just mark as completed
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .update({
      status: 'completed',
      approved_by: adminId,
      approved_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })
    .eq('id', txId)
    .select('*')
    .single();

  if (error || !data) throw new Error('Failed to approve transaction');

  await supabaseAdmin.from('admin_actions').insert({
    admin_id: adminId,
    action_type: tx.type === 'withdrawal' ? 'withdrawal_approve' : 'transaction_approve',
    target_user_id: tx.user_id,
    details: { transaction_id: txId, amount: tx.amount },
  });

  return data;
}

export async function rejectTransaction(txId: string, adminId: string) {
  const { data: tx } = await supabaseAdmin.from('transactions').select('*').eq('id', txId).single();
  if (!tx) throw new Error('Transaction not found');
  if (tx.status !== 'pending') throw new Error('Transaction is not pending');

  // Refund the balance for withdrawals
  if (tx.type === 'withdrawal') {
    const { data: account } = await supabaseAdmin
      .from('trading_accounts')
      .select('balance')
      .eq('id', tx.account_id)
      .single();

    if (account) {
      await supabaseAdmin
        .from('trading_accounts')
        .update({
          balance: Number(account.balance) + Number(tx.amount),
          equity: Number(account.balance) + Number(tx.amount),
          buying_power: Number(account.balance) + Number(tx.amount),
          updated_at: new Date().toISOString(),
        })
        .eq('id', tx.account_id);
    }
  }

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .update({ status: 'rejected' })
    .eq('id', txId)
    .select('*')
    .single();

  if (error || !data) throw new Error('Failed to reject transaction');

  await supabaseAdmin.from('admin_actions').insert({
    admin_id: adminId,
    action_type: tx.type === 'withdrawal' ? 'withdrawal_reject' : 'transaction_reject',
    target_user_id: tx.user_id,
    details: { transaction_id: txId },
  });

  return data;
}

export async function exportCSV(filters: { type?: string; status?: string; userId?: string }): Promise<string> {
  let query = supabaseAdmin.from('transactions').select('*').order('created_at', { ascending: false });

  if (filters.type) query = query.eq('type', filters.type);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.userId) query = query.eq('user_id', filters.userId);

  const { data, error } = await query;
  if (error) throw error;

  const headers = 'id,type,status,amount,currency,fee,net_amount,description,created_at\n';
  const rows = (data || []).map((tx) =>
    [tx.id, tx.type, tx.status, tx.amount, tx.currency, tx.fee, tx.net_amount, `"${tx.description || ''}"`, tx.created_at].join(','),
  ).join('\n');

  return headers + rows;
}

// --- AI Control ---

export async function getAIGlobalParams() {
  const { data, error } = await supabaseAdmin
    .from('platform_settings')
    .select('value')
    .eq('key', 'ai_global_params')
    .single();

  if (error || !data) throw new Error('AI params not found');
  return data.value as AIGlobalParams;
}

export async function updateAIGlobalParams(adminId: string, params: Partial<AIGlobalParams>) {
  const current = await getAIGlobalParams();
  const updated = { ...current, ...params };

  const { error } = await supabaseAdmin
    .from('platform_settings')
    .update({ value: updated, updated_by: adminId, updated_at: new Date().toISOString() })
    .eq('key', 'ai_global_params');

  if (error) throw error;

  await supabaseAdmin.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'ai_override',
    details: { params },
  });

  return updated;
}

export async function listAIOverrides(): Promise<UserAIOverride[]> {
  const { data, error } = await supabaseAdmin
    .from('user_ai_overrides')
    .select('*');

  if (error) throw error;
  return data || [];
}

export async function setAIOverride(userId: string, adminId: string, input: Partial<UserAIOverride>) {
  const { data, error } = await supabaseAdmin
    .from('user_ai_overrides')
    .upsert({
      user_id: userId,
      ...input,
      set_by: adminId,
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error || !data) throw new Error('Failed to set override');

  await supabaseAdmin.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'ai_override',
    target_user_id: userId,
    details: input as any,
  });

  return data;
}

export async function removeAIOverride(userId: string) {
  const { error } = await supabaseAdmin
    .from('user_ai_overrides')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}

export async function emergencyStop(adminId: string) {
  await updateAIGlobalParams(adminId, {
    emergency_stop: true,
  } as Partial<AIGlobalParams>);

  await supabaseAdmin.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'ai_emergency_stop',
    details: { timestamp: new Date().toISOString() },
  });
}

export async function emergencyResume(adminId: string) {
  await updateAIGlobalParams(adminId, {
    emergency_stop: false,
  } as Partial<AIGlobalParams>);

  await supabaseAdmin.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'ai_emergency_resume',
    details: { timestamp: new Date().toISOString() },
  });
}

export async function getAIStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayTrades, allTrades, activeSignals] = await Promise.all([
    supabaseAdmin.from('trades').select('*', { count: 'exact', head: true }).eq('source', 'ai').gte('opened_at', today.toISOString()),
    supabaseAdmin.from('trades').select('*', { count: 'exact', head: true }).eq('source', 'ai'),
    supabaseAdmin.from('ai_signals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  // Calculate win rate
  const { count: wins } = await supabaseAdmin
    .from('trades')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'ai')
    .eq('status', 'closed')
    .gt('pnl_realized', 0);

  const { count: total } = await supabaseAdmin
    .from('trades')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'ai')
    .eq('status', 'closed');

  return {
    daily_trades: todayTrades.count || 0,
    total_trades: allTrades.count || 0,
    active_signals: activeSignals.count || 0,
    win_rate: total && total > 0 ? ((wins || 0) / total) * 100 : 0,
    total_wins: wins || 0,
    total_closed: total || 0,
  };
}

// --- Audit ---

export async function getAuditLog(page: number, limit: number) {
  const { offset } = getPagination({ page, limit });

  const { data, error, count } = await supabaseAdmin
    .from('admin_actions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return { data: data || [], meta: getPaginationMeta(count || 0, page, limit) };
}
