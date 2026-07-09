import { supabaseAdmin } from '../../config/supabase.js';
import { getPagination, getPaginationMeta } from '@tradescope/shared-utils';
import type { AISignal, AISettings, UpdateAISettingsRequest, AIAnalysis } from '@tradescope/shared-types';
import { generateAnalysis } from '../../engine/mock-ai-engine.js';

export async function getSignals(
  userId: string,
  filters: { status?: string; page: number; limit: number },
): Promise<{ data: AISignal[]; meta: ReturnType<typeof getPaginationMeta> }> {
  const { page, limit, offset } = getPagination(filters);

  let query = supabaseAdmin
    .from('ai_signals')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.status) query = query.eq('status', filters.status);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: data || [],
    meta: getPaginationMeta(count || 0, page, limit),
  };
}

export async function getSignalById(signalId: string, userId: string): Promise<AISignal> {
  const { data, error } = await supabaseAdmin
    .from('ai_signals')
    .select('*')
    .eq('id', signalId)
    .eq('user_id', userId)
    .single();

  if (error || !data) throw new Error('Signal not found');
  return data;
}

export async function getSettings(userId: string): Promise<AISettings> {
  const { data, error } = await supabaseAdmin
    .from('ai_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // Create default settings if they don't exist
    const { data: newSettings } = await supabaseAdmin
      .from('ai_settings')
      .insert({
        user_id: userId,
        risk_level: 'moderate',
        max_daily_trades: 10,
        max_position_size: 10,
        daily_loss_limit: 500,
        daily_profit_target: 1000,
        stop_loss_pct: 2,
        take_profit_pct: 5,
        max_leverage: 1,
      })
      .select('*')
      .single();

    if (!newSettings) throw new Error('Failed to create AI settings');
    return newSettings;
  }

  return data;
}

export async function updateSettings(userId: string, input: UpdateAISettingsRequest): Promise<AISettings> {
  // Ensure settings exist
  await getSettings(userId);

  const { data, error } = await supabaseAdmin
    .from('ai_settings')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error || !data) throw new Error('Failed to update AI settings');
  return data;
}

export async function requestAnalysis(userId: string, symbol: string, accountId: string): Promise<AIAnalysis> {
  // Verify account
  const { data: account } = await supabaseAdmin
    .from('trading_accounts')
    .select('id')
    .eq('id', accountId)
    .eq('user_id', userId)
    .single();

  if (!account) throw new Error('Account not found');

  // Get AI settings
  const settings = await getSettings(userId);

  return generateAnalysis(symbol, settings);
}
