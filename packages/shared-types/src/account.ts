export interface TradingAccount {
  id: string;
  user_id: string;
  account_name: string;
  account_type: 'live' | 'demo';
  currency: string;
  balance: number;
  equity: number;
  buying_power: number;
  margin_used: number;
  unrealized_pnl: number;
  daily_pnl: number;
  is_active: boolean;
  leverage_default: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountRequest {
  account_name: string;
  account_type: 'live' | 'demo';
  currency?: string;
  leverage_default?: number;
}

export interface UpdateAccountRequest {
  account_name?: string;
  is_active?: boolean;
}

export interface PortfolioSummary {
  total_balance: number;
  total_equity: number;
  available: number;
  invested: number;
  daily_pnl: number;
  daily_pnl_pct: number;
  total_return_pct: number;
  open_positions: number;
  buying_power: number;
  margin_used: number;
}
