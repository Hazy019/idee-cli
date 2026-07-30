-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema private for RLS security definer helper functions
CREATE SCHEMA IF NOT EXISTS private;

-- 1. Organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Org Members table
CREATE TABLE IF NOT EXISTS public.org_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(organization_id, user_id)
);

-- 4. Service Accounts (CI Tokens) table
CREATE TABLE IF NOT EXISTS public.service_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Telemetry Logs table (APPEND-ONLY)
CREATE TABLE IF NOT EXISTS public.telemetry_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    machine_hash TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('interactive', 'ci')),
    execution_time_ms INTEGER NOT NULL CHECK (execution_time_ms >= 0),
    packages_installed TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    packages_skipped TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    packages_failed JSONB DEFAULT '[]'::JSONB NOT NULL,
    override_packages TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Audit Logs table (APPEND-ONLY)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    details JSONB DEFAULT '{}'::JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- B-Tree Indexes for fast RLS and querying
CREATE INDEX IF NOT EXISTS idx_users_org_id ON public.users(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.org_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_service_accounts_org_id ON public.service_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_org_id ON public.telemetry_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON public.telemetry_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON public.audit_logs(organization_id);

-- SECURITY DEFINER STABLE Helper Function for cached RLS evaluations
CREATE OR REPLACE FUNCTION private.user_org_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT organization_id FROM public.org_members WHERE user_id = (SELECT auth.uid())
    UNION
    SELECT organization_id FROM public.users WHERE id = (SELECT auth.uid());
$$;

-- Enable Row-Level Security (RLS) on all application tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Organizations
CREATE POLICY "Users can view their own organization"
    ON public.organizations FOR SELECT
    USING (id IN (SELECT private.user_org_ids()));

-- RLS Policies for Users
CREATE POLICY "Users can view members of their organization"
    ON public.users FOR SELECT
    USING (organization_id IN (SELECT private.user_org_ids()));

-- RLS Policies for Org Members
CREATE POLICY "Members can view org members"
    ON public.org_members FOR SELECT
    USING (organization_id IN (SELECT private.user_org_ids()));

-- RLS Policies for Service Accounts
CREATE POLICY "Users can view org service accounts"
    ON public.service_accounts FOR SELECT
    USING (organization_id IN (SELECT private.user_org_ids()));

CREATE POLICY "Admins can manage org service accounts"
    ON public.service_accounts FOR ALL
    USING (organization_id IN (SELECT private.user_org_ids()));

-- RLS Policies for Telemetry Logs (APPEND-ONLY: ONLY INSERT and SELECT defined)
CREATE POLICY "Authenticated users can insert telemetry for their org"
    ON public.telemetry_logs FOR INSERT
    WITH CHECK (organization_id IN (SELECT private.user_org_ids()));

CREATE POLICY "Org members can select telemetry logs"
    ON public.telemetry_logs FOR SELECT
    USING (organization_id IN (SELECT private.user_org_ids()));

-- RLS Policies for Audit Logs (APPEND-ONLY: ONLY INSERT and SELECT defined)
CREATE POLICY "Authenticated users can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (organization_id IN (SELECT private.user_org_ids()));

CREATE POLICY "Org members can select audit logs"
    ON public.audit_logs FOR SELECT
    USING (organization_id IN (SELECT private.user_org_ids()));
