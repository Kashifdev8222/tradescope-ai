-- TradeScope AI — Initial Database Schema
-- Run this in Supabase SQL Editor or via migration tool

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE public.user_role AS ENUM ('user', 'admin');

CREATE TYPE public.account_type AS ENUM ('live', 'demo');

CREATE TYPE public.transaction_type AS ENUM (
  'deposit', 'withdrawal', 'trade_credit', 'trade_debit',
  'fee', 'interest', 'adjustment', 'withdrawal_reversal'
);

CREATE TYPE public.transaction_status AS ENUM (
  'pending', 'approved', 'completed', 'failed', 'reversed', 'cancelled'
);

CREATE TYPE public.trade_side AS ENUM ('buy', 'sell');

CREATE TYPE public.trade_status AS ENUM ('open', 'closed', 'cancelled', 'pending');

CREATE TYPE public.trade_source AS ENUM ('manual', 'ai');

CREATE TYPE public.signal_action AS ENUM ('buy', 'sell', 'hold', 'close');

CREATE TYPE public.signal_status AS ENUM ('pending', 'executed', 'rejected', 'expired');

CREATE TYPE public.risk_level AS ENUM ('conservative', 'moderate', 'aggressive');

CREATE TYPE public.activity_action AS ENUM ('buy', 'sell', 'close', 'profit', 'loss');

CREATE TYPE public.admin_action_type AS ENUM (
  'user_suspend', 'user_activate', 'user_create', 'user_ai_toggle',
  'balance_adjust', 'transaction_approve', 'transaction_reject',
  'ai_override', 'ai_emergency_stop', 'ai_emergency_resume',
  'platform_setting_change', 'withdrawal_approve', 'withdrawal_reject'
);

-- ============================================================
-- TABLES
-- ============================================================

-- 1. Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  display_name  TEXT,
  avatar_url    TEXT,
  role          user_role NOT NULL DEFAULT 'user',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  ai_enabled    BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Trading Accounts
CREATE TABLE public.trading_accounts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_name        TEXT NOT NULL DEFAULT 'Primary',
  account_type        account_type NOT NULL DEFAULT 'live',
  currency            TEXT NOT NULL DEFAULT 'USD',
  balance             NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  equity              NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  buying_power        NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  margin_used         NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  unrealized_pnl      NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  daily_pnl           NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  leverage_default    INTEGER NOT NULL DEFAULT 1,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Transactions
CREATE TABLE public.transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id        UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type              transaction_type NOT NULL,
  status            transaction_status NOT NULL DEFAULT 'pending',
  amount            NUMERIC(18,2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'USD',
  fee               NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  net_amount        NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  description       TEXT,
  reference_id      TEXT,
  destination       TEXT,
  source            TEXT,
  metadata          JSONB DEFAULT '{}'::jsonb,
  approved_by       UUID REFERENCES public.profiles(id),
  approved_at       TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Trades
CREATE TABLE public.trades (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id        UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  symbol            TEXT NOT NULL,
  side              trade_side NOT NULL,
  status            trade_status NOT NULL DEFAULT 'open',
  source            trade_source NOT NULL DEFAULT 'manual',
  quantity          NUMERIC(18,4) NOT NULL,
  entry_price       NUMERIC(18,4) NOT NULL,
  current_price     NUMERIC(18,4),
  stop_loss         NUMERIC(18,4),
  take_profit       NUMERIC(18,4),
  exit_price        NUMERIC(18,4),
  pnl_realized      NUMERIC(18,2) DEFAULT 0.00,
  pnl_unrealized    NUMERIC(18,2) DEFAULT 0.00,
  commission        NUMERIC(18,2) DEFAULT 0.00,
  swap_fees         NUMERIC(18,2) DEFAULT 0.00,
  total_return      NUMERIC(18,4),
  ai_signal_id      UUID,
  notes             TEXT,
  opened_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. AI Signals
CREATE TABLE public.ai_signals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id        UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  symbol            TEXT NOT NULL,
  action            signal_action NOT NULL,
  confidence        NUMERIC(5,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  entry_price       NUMERIC(18,4),
  stop_loss         NUMERIC(18,4),
  take_profit       NUMERIC(18,4),
  position_size     NUMERIC(18,4),
  reason            TEXT,
  analysis_data     JSONB DEFAULT '{}'::jsonb,
  status            signal_status NOT NULL DEFAULT 'pending',
  executed_trade_id UUID,
  expires_at        TIMESTAMPTZ,
  generated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. AI Settings
CREATE TABLE public.ai_settings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  risk_level          risk_level NOT NULL DEFAULT 'moderate',
  max_daily_trades    INTEGER NOT NULL DEFAULT 10,
  max_position_size   NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  daily_loss_limit    NUMERIC(18,2) NOT NULL DEFAULT 500.00,
  daily_profit_target NUMERIC(18,2) NOT NULL DEFAULT 1000.00,
  stop_loss_pct       NUMERIC(5,2) NOT NULL DEFAULT 2.00,
  take_profit_pct     NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  max_leverage        INTEGER NOT NULL DEFAULT 1,
  allowed_symbols     TEXT[] DEFAULT '{}'::text[],
  is_active           BOOLEAN NOT NULL DEFAULT true,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Portfolio Snapshots
CREATE TABLE public.portfolio_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance         NUMERIC(18,2) NOT NULL,
  equity          NUMERIC(18,2) NOT NULL,
  unrealized_pnl  NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  daily_pnl       NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  margin_used     NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  buying_power    NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  open_positions  INTEGER NOT NULL DEFAULT 0,
  snapshot_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Leaderboard Entries
CREATE TABLE public.leaderboard_entries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  trader_id         TEXT NOT NULL UNIQUE,
  display_name      TEXT,
  total_trades      INTEGER NOT NULL DEFAULT 0,
  wins              INTEGER NOT NULL DEFAULT 0,
  losses            INTEGER NOT NULL DEFAULT 0,
  win_rate          NUMERIC(5,2) DEFAULT 0.00,
  total_profit      NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  total_profit_pct  NUMERIC(8,2) DEFAULT 0.00,
  current_streak    INTEGER NOT NULL DEFAULT 0,
  best_trade        NUMERIC(18,2) DEFAULT 0.00,
  rank              INTEGER,
  is_visible        BOOLEAN NOT NULL DEFAULT true,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Trader Activity Feed
CREATE TABLE public.trader_activity_feed (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_id  UUID NOT NULL REFERENCES public.leaderboard_entries(id) ON DELETE CASCADE,
  action          activity_action NOT NULL,
  symbol          TEXT NOT NULL,
  quantity        NUMERIC(18,4),
  price           NUMERIC(18,4),
  pnl             NUMERIC(18,2),
  pnl_pct         NUMERIC(8,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Platform Settings
CREATE TABLE public.platform_settings (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key                     TEXT NOT NULL UNIQUE,
  value                   JSONB NOT NULL,
  description             TEXT,
  updated_by              UUID REFERENCES public.profiles(id),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Admin Actions
CREATE TABLE public.admin_actions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type     admin_action_type NOT NULL,
  target_user_id  UUID REFERENCES public.profiles(id),
  details         JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address      INET,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. User AI Overrides
CREATE TABLE public.user_ai_overrides (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  max_position_size   NUMERIC(5,2),
  max_daily_trades    INTEGER,
  stop_loss_pct       NUMERIC(5,2),
  take_profit_pct     NUMERIC(5,2),
  max_leverage        INTEGER,
  is_ai_suspended     BOOLEAN NOT NULL DEFAULT false,
  reason              TEXT,
  set_by              UUID NOT NULL REFERENCES public.profiles(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_trading_accounts_user ON public.trading_accounts(user_id);
CREATE INDEX idx_transactions_account ON public.transactions(account_id);
CREATE INDEX idx_transactions_user ON public.transactions(user_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_created ON public.transactions(created_at DESC);
CREATE INDEX idx_trades_account ON public.trades(account_id);
CREATE INDEX idx_trades_user ON public.trades(user_id);
CREATE INDEX idx_trades_symbol ON public.trades(symbol);
CREATE INDEX idx_trades_status ON public.trades(status);
CREATE INDEX idx_trades_opened ON public.trades(opened_at DESC);
CREATE INDEX idx_ai_signals_user ON public.ai_signals(user_id);
CREATE INDEX idx_ai_signals_account ON public.ai_signals(account_id);
CREATE INDEX idx_ai_signals_status ON public.ai_signals(status);
CREATE INDEX idx_ai_signals_generated ON public.ai_signals(generated_at DESC);
CREATE INDEX idx_ai_settings_user ON public.ai_settings(user_id);
CREATE INDEX idx_snapshots_account_time ON public.portfolio_snapshots(account_id, snapshot_at DESC);
CREATE INDEX idx_leaderboard_rank ON public.leaderboard_entries(rank NULLS LAST);
CREATE INDEX idx_leaderboard_profit ON public.leaderboard_entries(total_profit DESC);
CREATE INDEX idx_activity_feed_created ON public.trader_activity_feed(created_at DESC);
CREATE INDEX idx_admin_actions_admin ON public.admin_actions(admin_id);
CREATE INDEX idx_admin_actions_type ON public.admin_actions(action_type);
CREATE INDEX idx_admin_actions_created ON public.admin_actions(created_at DESC);
CREATE INDEX idx_user_ai_overrides_user ON public.user_ai_overrides(user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    CASE WHEN NEW.email LIKE 'admin%' THEN 'admin'::user_role ELSE 'user'::user_role END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-create trading account when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_profile_account()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.trading_accounts (user_id, account_name, account_type)
  VALUES (NEW.id, 'Primary', 'live'::account_type);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_account();

-- Auto-create AI settings when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_ai_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ai_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_ai_settings ON public.profiles;
CREATE TRIGGER on_profile_ai_settings
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_ai_settings();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.trading_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON public.trades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_ai_settings_updated_at BEFORE UPDATE ON public.ai_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO public.platform_settings (key, value, description) VALUES
  ('leverage_defaults', '{"max": 100, "default": 1, "options": [1, 5, 10, 20, 30, 50, 100]}'::jsonb, 'Available leverage options'),
  ('minimum_deposit', '{"USD": 50, "BTC": 0.001, "ETH": 0.01}'::jsonb, 'Minimum deposit amounts by currency'),
  ('fees', '{"commission_rate": 0.001, "withdrawal_fee_flat": 25, "withdrawal_fee_pct": 0.0, "overnight_swap": 0.0002}'::jsonb, 'Fee structure'),
  ('ai_global_params', '{"max_position_size_pct": 25, "max_daily_trades_global": 100, "default_stop_loss_pct": 2, "default_take_profit_pct": 5, "emergency_stop": false}'::jsonb, 'Global AI trading parameters'),
  ('platform_info', '{"name": "TradeScope AI", "version": "1.0.0", "maintenance_mode": false}'::jsonb, 'Platform metadata')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- HELPER FUNCTION: is_admin()
-- Must be created AFTER profiles table exists and BEFORE RLS policies
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trader_activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ai_overrides ENABLE ROW LEVEL SECURITY;

-- profiles: user reads own, admin reads all
CREATE POLICY profiles_select ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

-- profiles: user updates own (non-role fields)
CREATE POLICY profiles_update ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- profiles: admin updates any
CREATE POLICY profiles_update_admin ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- trading_accounts
CREATE POLICY accounts_select ON public.trading_accounts FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY accounts_insert ON public.trading_accounts FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY accounts_update ON public.trading_accounts FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin());

-- transactions
CREATE POLICY transactions_select ON public.transactions FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY transactions_insert ON public.transactions FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- trades
CREATE POLICY trades_select ON public.trades FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY trades_insert ON public.trades FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY trades_update ON public.trades FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin());

-- ai_signals
CREATE POLICY ai_signals_select ON public.ai_signals FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

-- ai_settings
CREATE POLICY ai_settings_select ON public.ai_settings FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY ai_settings_update ON public.ai_settings FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin());

-- leaderboard: visible to all authenticated
CREATE POLICY leaderboard_select ON public.leaderboard_entries FOR SELECT
  USING (is_visible = true OR public.is_admin());

-- activity feed: visible to all authenticated
CREATE POLICY activity_select ON public.trader_activity_feed FOR SELECT
  USING (true);

-- platform_settings: admin only
CREATE POLICY platform_settings_select ON public.platform_settings FOR SELECT
  USING (public.is_admin());

-- admin_actions: admin only
CREATE POLICY admin_actions_select ON public.admin_actions FOR SELECT
  USING (public.is_admin());

-- user_ai_overrides
CREATE POLICY overrides_select ON public.user_ai_overrides FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

-- Update account balance after a trade closes
CREATE OR REPLACE FUNCTION public.update_account_after_trade(
  p_account_id UUID,
  p_pnl NUMERIC
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_balance NUMERIC;
BEGIN
  SELECT balance INTO v_balance FROM public.trading_accounts WHERE id = p_account_id;

  UPDATE public.trading_accounts
  SET
    balance = v_balance + p_pnl,
    equity = v_balance + p_pnl,
    buying_power = v_balance + p_pnl,
    daily_pnl = COALESCE(daily_pnl, 0) + p_pnl,
    updated_at = now()
  WHERE id = p_account_id;
END;
$$;
