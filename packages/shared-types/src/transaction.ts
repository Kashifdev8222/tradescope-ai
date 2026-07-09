export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'trade_credit'
  | 'trade_debit'
  | 'fee'
  | 'interest'
  | 'adjustment'
  | 'withdrawal_reversal';

export type TransactionStatus =
  | 'pending'
  | 'approved'
  | 'completed'
  | 'failed'
  | 'reversed'
  | 'cancelled';

export interface Transaction {
  id: string;
  account_id: string;
  user_id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  fee: number;
  net_amount: number;
  description: string | null;
  reference_id: string | null;
  destination: string | null;
  source: string | null;
  metadata: Record<string, unknown>;
  approved_by: string | null;
  approved_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface DepositRequest {
  account_id: string;
  amount: number;
  currency?: string;
  source?: string;
  reference_id?: string;
}

export interface WithdrawalRequest {
  account_id: string;
  amount: number;
  currency?: string;
  destination: string;
  reference_id?: string;
}

export interface TransactionFilter {
  type?: TransactionType;
  status?: TransactionStatus;
  account_id?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
