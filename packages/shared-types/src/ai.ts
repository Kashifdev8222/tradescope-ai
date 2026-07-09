export type RiskLevel = 'conservative' | 'moderate' | 'aggressive';
export type SignalAction = 'buy' | 'sell' | 'hold' | 'close';
export type SignalStatus = 'pending' | 'executed' | 'rejected' | 'expired';

export interface AISettings {
  id: string;
  user_id: string;
  risk_level: RiskLevel;
  max_daily_trades: number;
  max_position_size: number;
  daily_loss_limit: number;
  daily_profit_target: number;
  stop_loss_pct: number;
  take_profit_pct: number;
  max_leverage: number;
  allowed_symbols: string[];
  is_active: boolean;
  updated_at: string;
}

export interface UpdateAISettingsRequest {
  risk_level?: RiskLevel;
  max_daily_trades?: number;
  max_position_size?: number;
  daily_loss_limit?: number;
  daily_profit_target?: number;
  stop_loss_pct?: number;
  take_profit_pct?: number;
  max_leverage?: number;
  allowed_symbols?: string[];
  is_active?: boolean;
}

export interface AISignal {
  id: string;
  account_id: string;
  user_id: string;
  symbol: string;
  action: SignalAction;
  confidence: number;
  entry_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  position_size: number | null;
  reason: string | null;
  analysis_data: Record<string, unknown>;
  status: SignalStatus;
  executed_trade_id: string | null;
  expires_at: string | null;
  generated_at: string;
}

export interface AIAnalysisRequest {
  symbol: string;
  account_id: string;
}

export interface AIAnalysis {
  symbol: string;
  action: SignalAction;
  confidence: number;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  position_size: number;
  reason: string;
  analysis_breakdown: {
    trend_score: number;
    momentum_score: number;
    volatility_score: number;
    volume_score: number;
    sentiment_score: number;
  };
}

export interface AIGlobalParams {
  max_position_size_pct: number;
  max_daily_trades_global: number;
  default_stop_loss_pct: number;
  default_take_profit_pct: number;
  emergency_stop: boolean;
}

export interface UserAIOverride {
  id: string;
  user_id: string;
  max_position_size: number | null;
  max_daily_trades: number | null;
  stop_loss_pct: number | null;
  take_profit_pct: number | null;
  max_leverage: number | null;
  is_ai_suspended: boolean;
  reason: string | null;
  set_by: string;
  created_at: string;
  updated_at: string;
}
