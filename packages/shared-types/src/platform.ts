export interface PlatformSettings {
  id: string;
  key: string;
  value: Record<string, unknown>;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}

export interface LeverageDefaults {
  max: number;
  default: number;
  options: number[];
}

export interface FeeStructure {
  commission_rate: number;
  withdrawal_fee_flat: number;
  withdrawal_fee_pct: number;
  overnight_swap: number;
}

export interface MinimumDeposit {
  USD: number;
  BTC: number;
  ETH: number;
}

export interface PlatformInfo {
  name: string;
  version: string;
  maintenance_mode: boolean;
}
