-- Day 2 Corrective Migration: Madola Proposal Studio Schema, Security, and Idempotent Remote Alignment

-- ============================================================================
-- 1. PROFILES & ROLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'salesperson' CHECK (role IN ('admin', 'manager', 'salesperson', 'viewer')),
  avatar_url TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current executing user has admin role
-- SECURITY DEFINER is required to inspect public.profiles without triggering recursive RLS loops
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = (SELECT auth.uid()) 
      AND role = 'admin'
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Helper function to check if current executing user has manager or admin role
CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = (SELECT auth.uid()) 
      AND role IN ('admin', 'manager')
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_manager_or_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_manager_or_admin() TO authenticated;

-- Automated Profile Creation Trigger
-- SECURITY DEFINER is required to insert a row into public.profiles upon auth.users creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'salesperson' -- Forced safe default role; ignores any client-supplied role payload
  );
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Dual-Layer Role Protection: Column Privileges & Trigger
REVOKE UPDATE ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT UPDATE (full_name, avatar_url) ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- SECURITY DEFINER is required to check public.is_admin() during profile updates
  IF OLD.role IS DISTINCT FROM NEW.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only Administrators can alter user roles.';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.prevent_profile_role_change() FROM PUBLIC, anon;

DROP TRIGGER IF EXISTS enforce_profile_role_protection ON public.profiles;
CREATE TRIGGER enforce_profile_role_protection
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_change();

-- RLS Policies for Profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile fields" ON public.profiles;
CREATE POLICY "Users can update their own profile fields"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- ============================================================================
-- 2. CUSTOMERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT NULL,
  city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'United Kingdom',
  created_by UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Idempotent Column Alignments for Pre-existing Remote Table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'United Kingdom';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS created_by UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_customers_created_by ON public.customers(created_by);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_postcode ON public.customers(postcode);

DROP POLICY IF EXISTS "Customers viewable by authenticated users" ON public.customers;
CREATE POLICY "Customers viewable by authenticated users"
  ON public.customers FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Salespeople and Admins can insert customers" ON public.customers;
CREATE POLICY "Salespeople and Admins can insert customers"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (created_by = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Salespeople can update their own created customers; Admins can update all" ON public.customers;
CREATE POLICY "Salespeople can update their own created customers; Admins can update all"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (created_by = (SELECT auth.uid()) OR public.is_manager_or_admin())
  WITH CHECK (created_by = (SELECT auth.uid()) OR public.is_manager_or_admin());

-- ============================================================================
-- 3. PROPOSAL TEMPLATES & SECTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.proposal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.proposal_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Templates viewable by authenticated users" ON public.proposal_templates;
CREATE POLICY "Templates viewable by authenticated users"
  ON public.proposal_templates FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Managers and Admins can manage templates" ON public.proposal_templates;
CREATE POLICY "Managers and Admins can manage templates"
  ON public.proposal_templates FOR ALL
  TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

CREATE TABLE IF NOT EXISTS public.template_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.proposal_templates(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  settings JSONB NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.template_sections ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_template_sections_template ON public.template_sections(template_id);

DROP POLICY IF EXISTS "Template sections viewable by authenticated users" ON public.template_sections;
CREATE POLICY "Template sections viewable by authenticated users"
  ON public.template_sections FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- 4. CONCURRENCY REFERENCE GENERATOR & PROPOSALS ALIGNMENT
-- ============================================================================

-- Sequence & Reference Function must exist BEFORE adding proposal reference column default
CREATE SEQUENCE IF NOT EXISTS public.proposal_ref_seq START WITH 1 INCREMENT BY 1;
REVOKE ALL ON SEQUENCE public.proposal_ref_seq FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_next_proposal_reference()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  next_val BIGINT;
BEGIN
  -- SECURITY DEFINER is required as the sole controlled gateway to advance proposal_ref_seq
  SELECT nextval('public.proposal_ref_seq') INTO next_val;
  RETURN 'MAD-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(next_val::TEXT, 5, '0');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_next_proposal_reference() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_next_proposal_reference() TO authenticated;

CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL DEFAULT public.get_next_proposal_reference(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  created_by UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review_required', 'approved', 'published')),
  template_id UUID NULL REFERENCES public.proposal_templates(id),
  expires_at TIMESTAMPTZ NULL,
  published_at TIMESTAMPTZ NULL,
  published_by UUID NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Idempotent Column Alignments for Pre-existing Remote Proposals Table
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS reference TEXT UNIQUE DEFAULT public.get_next_proposal_reference();
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS created_by UUID NULL DEFAULT auth.uid() REFERENCES auth.users(id);
UPDATE public.proposals SET created_by = (SELECT id FROM auth.users LIMIT 1) WHERE created_by IS NULL;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS template_id UUID NULL REFERENCES public.proposal_templates(id);
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NULL;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ NULL;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS published_by UUID NULL REFERENCES auth.users(id);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_proposals_customer ON public.proposals(customer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_created_by ON public.proposals(created_by);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_reference ON public.proposals(reference);

DROP POLICY IF EXISTS "Proposals viewable by authenticated users" ON public.proposals;
CREATE POLICY "Proposals viewable by authenticated users"
  ON public.proposals FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Salespeople and Admins can create proposals" ON public.proposals;
CREATE POLICY "Salespeople and Admins can create proposals"
  ON public.proposals FOR INSERT
  TO authenticated
  WITH CHECK (created_by = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Salespeople can update their own proposals; Managers/Admins can update all" ON public.proposals;
CREATE POLICY "Salespeople can update their own proposals; Managers/Admins can update all"
  ON public.proposals FOR UPDATE
  TO authenticated
  USING (created_by = (SELECT auth.uid()) OR public.is_manager_or_admin())
  WITH CHECK (created_by = (SELECT auth.uid()) OR public.is_manager_or_admin());

-- ============================================================================
-- 5. PROPOSAL VERSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.proposal_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',
  snapshot JSONB NULL DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ NULL,
  approved_by UUID NULL REFERENCES auth.users(id)
);

ALTER TABLE public.proposal_versions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_proposal_versions_proposal ON public.proposal_versions(proposal_id);

DROP POLICY IF EXISTS "Proposal versions viewable by authenticated users" ON public.proposal_versions;
CREATE POLICY "Proposal versions viewable by authenticated users"
  ON public.proposal_versions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create proposal versions" ON public.proposal_versions;
CREATE POLICY "Users can create proposal versions"
  ON public.proposal_versions FOR INSERT
  TO authenticated
  WITH CHECK (created_by = (SELECT auth.uid()));

-- ============================================================================
-- 6. PRODUCTS CATALOG & SECURITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('panel', 'inverter', 'battery', 'ev_charger', 'other')),
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  description TEXT NULL,
  capacity NUMERIC NULL,
  unit TEXT NULL,
  image_url TEXT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Idempotent Column Alignments for Pre-existing Remote Products Table
-- Preserves existing columns: capacity_kwh, wattage, warranty, datasheet_url
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS capacity NUMERIC NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit TEXT NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Replaces any default permissive public/anon policies with strict authenticated RLS
DROP POLICY IF EXISTS "Products viewable by authenticated users" ON public.products;
DROP POLICY IF EXISTS "Allow anon read products" ON public.products;
DROP POLICY IF EXISTS "Public read products" ON public.products;

CREATE POLICY "Products viewable by authenticated users"
  ON public.products FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Managers and Admins can insert/update products" ON public.products;
CREATE POLICY "Managers and Admins can insert/update products"
  ON public.products FOR ALL
  TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

-- ============================================================================
-- 7. PROPOSAL EVENTS AUDIT LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.proposal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  user_id UUID NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  metadata JSONB NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.proposal_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_proposal_events_proposal ON public.proposal_events(proposal_id);

DROP POLICY IF EXISTS "Proposal events viewable by authenticated users" ON public.proposal_events;
CREATE POLICY "Proposal events viewable by authenticated users"
  ON public.proposal_events FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert proposal events" ON public.proposal_events;
CREATE POLICY "Authenticated users can insert proposal events"
  ON public.proposal_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
