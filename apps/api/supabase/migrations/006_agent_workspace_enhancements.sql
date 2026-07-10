-- TradeScope AI — Migration 006: Agent Workspace + Enhancements
-- Run AFTER 001-005 migrations in Supabase SQL Editor

-- ============================================================
-- AGENT TASKS TABLE (for Agent Workspace)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  assigned_to   UUID REFERENCES public.profiles(id),
  task_type     TEXT NOT NULL DEFAULT 'callback' CHECK (task_type IN ('callback','meeting','follow_up','review','other')),
  priority      TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
  title         TEXT NOT NULL,
  description   TEXT,
  scheduled_for TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_assignee ON public.agent_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON public.agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_scheduled ON public.agent_tasks(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_client ON public.agent_tasks(client_id);

ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tasks_select ON public.agent_tasks FOR SELECT USING (assigned_to = auth.uid() OR public.is_admin());
CREATE POLICY tasks_insert ON public.agent_tasks FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY tasks_update ON public.agent_tasks FOR UPDATE USING (assigned_to = auth.uid() OR public.is_admin());
CREATE POLICY tasks_delete ON public.agent_tasks FOR DELETE USING (public.is_admin());

-- ============================================================
-- CLIENT PHONES DIRECTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.client_phones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  number      TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'mobile' CHECK (type IN ('mobile','home','work','other')),
  is_primary  BOOLEAN NOT NULL DEFAULT false,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_phones_client ON public.client_phones(client_id);

ALTER TABLE public.client_phones ENABLE ROW LEVEL SECURITY;
CREATE POLICY phones_select ON public.client_phones FOR SELECT USING (public.is_admin());
CREATE POLICY phones_insert ON public.client_phones FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY phones_delete ON public.client_phones FOR DELETE USING (public.is_admin());

-- ============================================================
-- ENHANCE CLIENTS TABLE with missing columns
-- ============================================================
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS do_not_call BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS high_risk BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS complaint_filed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS identity_hash TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS phone_hash TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS email_hash TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS last_visit TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_identity_hash ON public.clients(identity_hash);

-- ============================================================
-- ENHANCE ROLES TABLE
-- ============================================================
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Add missing RLS policies for roles (INSERT/UPDATE/DELETE)
DO $$ BEGIN
  CREATE POLICY roles_insert ON public.roles FOR INSERT WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY roles_update ON public.roles FOR UPDATE USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY roles_delete ON public.roles FOR DELETE USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add missing RLS policies for permissions (INSERT)
DO $$ BEGIN
  CREATE POLICY permissions_insert ON public.permissions FOR INSERT WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add missing RLS policies for role_permissions (INSERT/DELETE)
DO $$ BEGIN
  CREATE POLICY role_permissions_insert ON public.role_permissions FOR INSERT WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY role_permissions_delete ON public.role_permissions FOR DELETE USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- ADD indexes for role_id on profiles
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);
