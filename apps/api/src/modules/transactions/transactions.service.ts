import { supabaseAdmin } from '../../config/supabase.js';
import { getPagination, getPaginationMeta } from '@tradescope/shared-utils';
import type { Transaction, TransactionFilter, DepositRequest, WithdrawalRequest } from '@tradescope/shared-types';

export async function getTransactions(
  userId: string,
  filters: TransactionFilter,
): Promise<{ data: Transaction[]; meta: ReturnType<typeof getPaginationMeta> }> {
  const { page, limit, offset } = getPagination(filters);

  let query = supabaseAdmin
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.type) query = query.eq('type', filters.type);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.account_id) query = query.eq('account_id', filters.account_id);
  if (filters.from) query = query.gte('created_at', filters.from);
  if (filters.to) query = query.lte('created_at', filters.to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    meta: getPaginationMeta(count || 0, page, limit),
  };
}

export async function getTransactionById(txId: string, userId: string): Promise<Transaction> {
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('id', txId)
    .eq('user_id', userId)
    .single();

  if (error || !data) throw new Error('Transaction not found');
  return data;
}

export async function createDeposit(userId: string, input: DepositRequest): Promise<Transaction> {
  // Verify account belongs to user
  const { data: account } = await supabaseAdmin
    .from('trading_accounts')
    .select('id, balance')
    .eq('id', input.account_id)
    .eq('user_id', userId)
    .single();

  if (!account) throw new Error('Account not found');

  const amount = input.amount;
  const fee = 0; // No fees on deposits

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .insert({
      account_id: input.account_id,
      user_id: userId,
      type: 'deposit',
      status: 'completed',
      amount,
      currency: input.currency || 'USD',
      fee,
      net_amount: amount - fee,
      source: input.source || 'bank_transfer',
      reference_id: input.reference_id || null,
      completed_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) throw error;

  // Update account balance
  await supabaseAdmin
    .from('trading_accounts')
    .update({
      balance: Number(account.balance) + amount,
      equity: Number(account.balance) + amount,
      buying_power: Number(account.balance) + amount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.account_id);

  return data;
}

export async function createWithdrawal(userId: string, input: WithdrawalRequest): Promise<Transaction> {
  // Verify account
  const { data: account } = await supabaseAdmin
    .from('trading_accounts')
    .select('id, balance')
    .eq('id', input.account_id)
    .eq('user_id', userId)
    .single();

  if (!account) throw new Error('Account not found');

  const amount = input.amount;

  // Get withdrawal fee
  const { data: feeSettings } = await supabaseAdmin
    .from('platform_settings')
    .select('value')
    .eq('key', 'fees')
    .single();

  const withdrawalFee = feeSettings?.value?.withdrawal_fee_flat || 25;
  const netAmount = amount - withdrawalFee;

  if (Number(account.balance) < amount) {
    throw new Error('Insufficient balance');
  }

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .insert({
      account_id: input.account_id,
      user_id: userId,
      type: 'withdrawal',
      status: 'pending',
      amount,
      currency: input.currency || 'USD',
      fee: withdrawalFee,
      net_amount: netAmount,
      destination: input.destination,
      reference_id: input.reference_id || null,
    })
    .select('*')
    .single();

  if (error) throw error;

  // Reserve the funds
  await supabaseAdmin
    .from('trading_accounts')
    .update({
      balance: Number(account.balance) - amount,
      equity: Number(account.balance) - amount,
      buying_power: Number(account.balance) - amount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.account_id);

  return data;
}
