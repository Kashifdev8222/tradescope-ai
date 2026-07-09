import { supabaseAdmin } from '../../config/supabase.js';
import { getPagination, getPaginationMeta } from '@tradescope/shared-utils';
import type { Trade, TradeFilter, PlaceTradeRequest, UpdateTradeRequest } from '@tradescope/shared-types';

export async function getTrades(
  userId: string,
  filters: TradeFilter,
): Promise<{ data: Trade[]; meta: ReturnType<typeof getPaginationMeta> }> {
  const { page, limit, offset } = getPagination(filters);

  let query = supabaseAdmin
    .from('trades')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('opened_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters.symbol) {
    query = query.eq('symbol', filters.symbol.toUpperCase());
  }
  if (filters.source) {
    query = query.eq('source', filters.source);
  }
  if (filters.account_id) {
    query = query.eq('account_id', filters.account_id);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    meta: getPaginationMeta(count || 0, page, limit),
  };
}

export async function getTradeById(tradeId: string, userId: string): Promise<Trade> {
  const { data, error } = await supabaseAdmin
    .from('trades')
    .select('*')
    .eq('id', tradeId)
    .eq('user_id', userId)
    .single();

  if (error || !data) throw new Error('Trade not found');
  return data;
}

export async function placeTrade(userId: string, input: PlaceTradeRequest): Promise<Trade> {
  // Verify account belongs to user
  const { data: account } = await supabaseAdmin
    .from('trading_accounts')
    .select('id')
    .eq('id', input.account_id)
    .eq('user_id', userId)
    .single();

  if (!account) throw new Error('Account not found');

  // Calculate commission
  const { data: feeSettings } = await supabaseAdmin
    .from('platform_settings')
    .select('value')
    .eq('key', 'fees')
    .single();

  const commissionRate = feeSettings?.value?.commission_rate || 0.001;
  const notionalValue = input.quantity * 0; // Will be set when price is known
  const commission = notionalValue * commissionRate;

  const { data, error } = await supabaseAdmin
    .from('trades')
    .insert({
      account_id: input.account_id,
      user_id: userId,
      symbol: input.symbol.toUpperCase(),
      side: input.side,
      quantity: input.quantity,
      entry_price: 0, // Will be updated by market data / mock engine
      stop_loss: input.stop_loss || null,
      take_profit: input.take_profit || null,
      source: input.source || 'manual',
      status: 'pending',
      commission,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateTrade(tradeId: string, userId: string, input: UpdateTradeRequest): Promise<Trade> {
  const { data, error } = await supabaseAdmin
    .from('trades')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', tradeId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error || !data) throw new Error('Failed to update trade');
  return data;
}

export async function closeTrade(tradeId: string, userId: string, exitPrice: number): Promise<Trade> {
  // Get existing trade
  const { data: trade } = await supabaseAdmin
    .from('trades')
    .select('*')
    .eq('id', tradeId)
    .eq('user_id', userId)
    .single();

  if (!trade) throw new Error('Trade not found');
  if (trade.status !== 'open') throw new Error('Trade is not open');

  const pnlRealized =
    trade.side === 'buy'
      ? (exitPrice - Number(trade.entry_price)) * Number(trade.quantity)
      : (Number(trade.entry_price) - exitPrice) * Number(trade.quantity);

  const totalReturn =
    Number(trade.entry_price) > 0
      ? ((exitPrice - Number(trade.entry_price)) / Number(trade.entry_price)) * 100
      : 0;

  const { data, error } = await supabaseAdmin
    .from('trades')
    .update({
      status: 'closed',
      exit_price: exitPrice,
      pnl_realized: pnlRealized,
      pnl_unrealized: 0,
      total_return: totalReturn,
      closed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', tradeId)
    .select('*')
    .single();

  if (error || !data) throw new Error('Failed to close trade');

  // Update account balance
  await supabaseAdmin.rpc('update_account_after_trade', {
    p_account_id: trade.account_id,
    p_pnl: pnlRealized,
  });

  return data;
}
