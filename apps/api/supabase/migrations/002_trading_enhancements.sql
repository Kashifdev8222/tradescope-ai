-- TradeScope AI — Trading Terminal Enhancements
-- Run this in Supabase SQL Editor

-- Add order type support to trades
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'market';
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS trigger_price NUMERIC(18,4);
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS instrument_class TEXT;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS swap_paid NUMERIC(18,2) DEFAULT 0;

-- Add constraint (skip if already exists)
DO $$ BEGIN
  ALTER TABLE public.trades ADD CONSTRAINT trades_order_type_check CHECK (order_type IN ('market','limit','stop'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Market data cache table for chart history persistence
CREATE TABLE IF NOT EXISTS public.market_data (
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL DEFAULT '1m',
  timestamp BIGINT NOT NULL,
  open NUMERIC(18,4),
  high NUMERIC(18,4),
  low NUMERIC(18,4),
  close NUMERIC(18,4),
  volume NUMERIC,
  PRIMARY KEY (symbol, timeframe, timestamp)
);

-- Add phone column to profiles (for registration)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update the new user trigger to include phone and display_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, phone, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    'user',
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;
