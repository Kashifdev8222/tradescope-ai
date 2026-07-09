export type AdminActionType =
  | 'user_suspend'
  | 'user_activate'
  | 'user_create'
  | 'user_ai_toggle'
  | 'balance_adjust'
  | 'transaction_approve'
  | 'transaction_reject'
  | 'ai_override'
  | 'ai_emergency_stop'
  | 'ai_emergency_resume'
  | 'platform_setting_change'
  | 'withdrawal_approve'
  | 'withdrawal_reject';

export interface AdminAction {
  id: string;
  admin_id: string;
  action_type: AdminActionType;
  target_user_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export interface AdminUserSearch {
  search?: string;
  status?: 'active' | 'suspended';
  page?: number;
  limit?: number;
}

export interface BalanceAdjustment {
  account_id: string;
  amount: number;
  reason: string;
}

export interface AIOverrideRequest {
  max_position_size?: number;
  max_daily_trades?: number;
  stop_loss_pct?: number;
  take_profit_pct?: number;
  max_leverage?: number;
  is_ai_suspended?: boolean;
  reason?: string;
}
