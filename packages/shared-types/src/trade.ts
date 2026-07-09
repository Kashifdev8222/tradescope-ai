export type TradeSide = 'buy' | 'sell';
export type TradeStatus = 'open' | 'closed' | 'cancelled' | 'pending';
export type TradeSource = 'manual' | 'ai';

export interface Trade {
  id: string;
  account_id: string;
  user_id: string;
  symbol: string;
  side: TradeSide;
  status: TradeStatus;
  source: TradeSource;
  quantity: number;
  entry_price: number;
  current_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  exit_price: number | null;
  pnl_realized: number;
  pnl_unrealized: number;
  commission: number;
  swap_fees: number;
  total_return: number | null;
  ai_signal_id: string | null;
  notes: string | null;
  opened_at: string;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaceTradeRequest {
  account_id: string;
  symbol: string;
  side: TradeSide;
  quantity: number;
  stop_loss?: number;
  take_profit?: number;
  source?: TradeSource;
}

export interface UpdateTradeRequest {
  stop_loss?: number | null;
  take_profit?: number | null;
}

export interface CloseTradeRequest {
  exit_price: number;
}

export interface TradeFilter {
  status?: TradeStatus | 'all';
  symbol?: string;
  source?: TradeSource;
  account_id?: string;
  page?: number;
  limit?: number;
}
