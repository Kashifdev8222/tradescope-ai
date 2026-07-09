import { supabaseAdmin } from '../../config/supabase.js';
import type { TradingAccount, PortfolioSummary, CreateAccountRequest, UpdateAccountRequest } from '@tradescope/shared-types';

export async function getAccounts(userId: string): Promise<TradingAccount[]> {
  const { data, error } = await supabaseAdmin
    .from('trading_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getAccountById(accountId: string, userId: string): Promise<TradingAccount> {
  const { data, error } = await supabaseAdmin
    .from('trading_accounts')
    .select('*')
    .eq('id', accountId)
    .eq('user_id', userId)
    .single();

  if (error || !data) throw new Error('Account not found');
  return data;
}

export async function createAccount(userId: string, input: CreateAccountRequest): Promise<TradingAccount> {
  const { data, error } = await supabaseAdmin
    .from('trading_accounts')
    .insert({
      user_id: userId,
      account_name: input.account_name,
      account_type: input.account_type,
      currency: input.currency || 'USD',
      leverage_default: input.leverage_default || 1,
      balance: 0,
      equity: 0,
      buying_power: 0,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateAccount(accountId: string, userId: string, input: UpdateAccountRequest): Promise<TradingAccount> {
  const { data, error } = await supabaseAdmin
    .from('trading_accounts')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', accountId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error || !data) throw new Error('Failed to update account');
  return data;
}

export async function getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
  const { data: accounts, error } = await supabaseAdmin
    .from('trading_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) throw error;

  const accountsList = accounts || [];

  const totalBalance = accountsList.reduce((sum, a) => sum + Number(a.balance), 0);
  const totalEquity = accountsList.reduce((sum, a) => sum + Number(a.equity), 0);
  const totalInvested = totalEquity; // equity = balance + unrealized PnL
  const availableBalance = accountsList.reduce((sum, a) => sum + Number(a.buying_power), 0);
  const dailyPnL = accountsList.reduce((sum, a) => sum + Number(a.daily_pnl), 0);
  const marginUsed = accountsList.reduce((sum, a) => sum + Number(a.margin_used), 0);

  // Count open positions across all accounts
  const { count } = await supabaseAdmin
    .from('trades')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'open');

  const openPositions = count || 0;

  return {
    total_balance: totalBalance,
    total_equity: totalEquity,
    available: availableBalance || totalBalance * 0.2,
    invested: totalInvested,
    daily_pnl: dailyPnL,
    daily_pnl_pct: totalBalance > 0 ? (dailyPnL / totalBalance) * 100 : 0,
    total_return_pct: totalBalance > 0 ? ((totalEquity - totalBalance) / totalBalance) * 100 : 0,
    open_positions: openPositions,
    buying_power: availableBalance || totalBalance * 0.2,
    margin_used: marginUsed,
  };
}
