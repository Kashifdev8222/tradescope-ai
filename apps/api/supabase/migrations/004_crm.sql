-- Phase 9: CRM - Clients & Leads

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  country TEXT,
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead','client','inactive','blocked')),
  source TEXT,
  notes TEXT,
  flags TEXT[] DEFAULT '{}',
  assigned_to UUID REFERENCES public.profiles(id),
  ftd_date TIMESTAMPTZ,
  last_contact TIMESTAMPTZ,
  consent_marketing BOOLEAN DEFAULT false,
  consent_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_clients_user ON public.clients(user_id);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY clients_admin ON public.clients FOR ALL USING (public.is_admin());

-- Client qualification profile
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS trading_experience TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS annual_income NUMERIC(18,2);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS savings NUMERIC(18,2);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS retirement_fund NUMERIC(18,2);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS risk_tolerance TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS investment_goals TEXT[];
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
