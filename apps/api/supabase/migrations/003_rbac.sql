-- Phase 8: RBAC - Roles & Permissions

-- Roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Role-Permission junction
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Add role column to profiles (extend existing user_role)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id);

-- ============================================================
-- SEED DATA
-- ============================================================

-- 7 Roles
INSERT INTO public.roles (name, slug, description, is_system) VALUES
  ('Owner', 'owner', 'Full platform access, bypasses all permission checks', true),
  ('Admin', 'admin', 'Platform administrator with most permissions', true),
  ('Account Manager', 'account_manager', 'Manages client accounts and relationships', true),
  ('Retention Manager', 'retention_manager', 'Focuses on client retention and satisfaction', true),
  ('Conversion Manager', 'conversion_manager', 'Handles lead conversion and sales', true),
  ('IT Manager', 'it_manager', 'Manages technical infrastructure and settings', true),
  ('Agent', 'agent', 'Basic operator access for daily tasks', true)
ON CONFLICT (slug) DO NOTHING;

-- 16 Permissions
INSERT INTO public.permissions (name, slug, description, category) VALUES
  ('View Users', 'users:read', 'View user directory and profiles', 'users'),
  ('Manage Users', 'users:write', 'Create, update, suspend users', 'users'),
  ('View Balances', 'balances:read', 'View platform balances and AUM', 'balances'),
  ('Adjust Balances', 'balances:write', 'Manually adjust user balances', 'balances'),
  ('View Transactions', 'transactions:read', 'View all transactions', 'transactions'),
  ('Approve Transactions', 'transactions:approve', 'Approve or reject pending transactions', 'transactions'),
  ('View AI Settings', 'ai:read', 'View AI global parameters and stats', 'ai'),
  ('Manage AI Settings', 'ai:write', 'Modify global AI parameters', 'ai'),
  ('Manage AI Overrides', 'ai:overrides', 'Set per-user AI overrides', 'ai'),
  ('Emergency Stop AI', 'ai:emergency', 'Trigger emergency stop for AI trading', 'ai'),
  ('View Platform Settings', 'settings:read', 'View platform configuration', 'settings'),
  ('Manage Platform Settings', 'settings:write', 'Modify platform configuration', 'settings'),
  ('View Clients', 'clients:read', 'View client profiles and CRM', 'crm'),
  ('Manage Clients', 'clients:write', 'Create and edit client records', 'crm'),
  ('KYC Review', 'kyc:decide', 'Approve or reject KYC documents', 'kyc'),
  ('Client Credentials', 'clients:credentials', 'View and set client passwords', 'crm')
ON CONFLICT (slug) DO NOTHING;

-- Assign permissions to roles
-- Owner: all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.slug = 'owner'
ON CONFLICT DO NOTHING;

-- Admin: all except KYC and credentials
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.slug = 'admin' AND p.slug NOT IN ('kyc:decide', 'clients:credentials')
ON CONFLICT DO NOTHING;

-- Account Manager: users read, clients read/write, KYC, balances read, transactions read
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.slug = 'account_manager' AND p.slug IN ('users:read','clients:read','clients:write','kyc:decide','balances:read','transactions:read')
ON CONFLICT DO NOTHING;

-- Agent: users read, clients read, transactions read
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.slug = 'agent' AND p.slug IN ('users:read','clients:read','transactions:read')
ON CONFLICT DO NOTHING;

-- IT Manager: settings read/write, AI read, balances read
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.slug = 'it_manager' AND p.slug IN ('settings:read','settings:write','ai:read','balances:read','transactions:read','users:read')
ON CONFLICT DO NOTHING;

-- RLS on new tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY roles_select ON public.roles FOR SELECT USING (public.is_admin());
CREATE POLICY permissions_select ON public.permissions FOR SELECT USING (public.is_admin());
CREATE POLICY role_permissions_select ON public.role_permissions FOR SELECT USING (public.is_admin());
