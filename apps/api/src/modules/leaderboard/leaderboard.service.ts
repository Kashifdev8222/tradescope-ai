import { supabaseAdmin } from '../../config/supabase.js';
import { getPagination, getPaginationMeta } from '@tradescope/shared-utils';
import type { LeaderboardEntry, TraderActivity, LeaderboardFilter } from '@tradescope/shared-types';

export async function getLeaderboard(
  filters: LeaderboardFilter,
): Promise<{ data: LeaderboardEntry[]; meta: ReturnType<typeof getPaginationMeta> }> {
  const { page, limit, offset } = getPagination(filters);

  const sortColumn =
    filters.sortBy === 'winRate'
      ? 'win_rate'
      : filters.sortBy === 'trades'
        ? 'total_trades'
        : 'total_profit';

  const { data, error, count } = await supabaseAdmin
    .from('leaderboard_entries')
    .select('*', { count: 'exact' })
    .eq('is_visible', true)
    .order(sortColumn, { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    data: data || [],
    meta: getPaginationMeta(count || 0, page, limit),
  };
}

export async function getActivityFeed(limit: number): Promise<TraderActivity[]> {
  const { data, error } = await supabaseAdmin
    .from('trader_activity_feed')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getTraderById(traderId: string): Promise<LeaderboardEntry> {
  const { data, error } = await supabaseAdmin
    .from('leaderboard_entries')
    .select('*')
    .eq('trader_id', traderId)
    .single();

  if (error || !data) throw new Error('Trader not found');
  return data;
}
