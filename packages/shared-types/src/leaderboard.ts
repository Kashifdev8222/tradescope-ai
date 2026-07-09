export interface LeaderboardEntry {
  id: string;
  user_id: string;
  trader_id: string;
  display_name: string | null;
  total_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  total_profit: number;
  total_profit_pct: number;
  current_streak: number;
  best_trade: number;
  rank: number | null;
  is_visible: boolean;
  updated_at: string;
}

export interface TraderActivity {
  id: string;
  leaderboard_id: string;
  action: 'buy' | 'sell' | 'close' | 'profit' | 'loss';
  symbol: string;
  quantity: number | null;
  price: number | null;
  pnl: number | null;
  pnl_pct: number | null;
  created_at: string;
}

export interface LeaderboardFilter {
  sortBy?: 'profit' | 'winRate' | 'trades';
  limit?: number;
  page?: number;
}
