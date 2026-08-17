-- ============================================================================
-- Day 3B Multi-Tenant Company Isolation Migration & RLS Security
-- File: supabase/migrations/20260811000000_day3b_block_proposal_schema.sql
-- ============================================================================

-- ============================================================================
-- 1. COMPANIES & PROFILES LINK
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Madola Energy',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default company if missing
INSERT INTO public.companies (name)
SELECT 'Madola Energy'
WHERE NOT EXISTS (SELECT 1 FROM public.companies WHERE name = 'Madola Energy');

-- Add company_id to profiles safely
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_id UUID NULL REFERENCES public.companies(id);

-- Link unassigned user profiles to default Madola Energy company
UPDATE public.profiles
SET company_id = (SELECT id FROM public.companies WHERE name = 'Madola Energy' LIMIT 1)
WHERE company_id IS NULL;

-- Helper Function to resolve executing user's company_id
CREATE OR REPLACE FUNCTION public.get_auth_company_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN (
    SELECT company_id 
    FROM public.profiles 
    WHERE id = (SELECT auth.uid()) 
    LIMIT 1
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_auth_company_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_auth_company_id() TO authenticated;

-- Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
CREATE POLICY "Users can view their own company"
  ON public.companies FOR SELECT
  TO authenticated
  USING (id = public.get_auth_company_id());

DROP POLICY IF EXISTS "Admins can update their own company" ON public.companies;
CREATE POLICY "Admins can update their own company"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (id = public.get_auth_company_id() AND public.is_manager_or_admin())
  WITH CHECK (id = public.get_auth_company_id() AND public.is_manager_or_admin());

-- ============================================================================
-- 2. COMPANY BRANDING (STRICT COMPANY ISOLATION)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.company_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES public.companies(id) ON DELETE CASCADE,
  logo_reference TEXT NULL,
  primary_color TEXT NOT NULL DEFAULT '#10b981',
  secondary_color TEXT NOT NULL DEFAULT '#0f172a',
  email TEXT NOT NULL DEFAULT 'proposals@madola.co.uk',
  phone TEXT NOT NULL DEFAULT '+44 (0) 800 123 4567',
  website TEXT NOT NULL DEFAULT 'https://madola.co.uk',
  address TEXT NOT NULL DEFAULT 'Madola House, Richmond, Surrey, UK',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.company_branding ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their company branding" ON public.company_branding;
CREATE POLICY "Users can view their company branding"
  ON public.company_branding FOR SELECT
  TO authenticated
  USING (company_id = public.get_auth_company_id());

DROP POLICY IF EXISTS "Managers and Admins can insert/update their company branding" ON public.company_branding;
CREATE POLICY "Managers and Admins can insert/update their company branding"
  ON public.company_branding FOR ALL
  TO authenticated
  USING (company_id = public.get_auth_company_id() AND public.is_manager_or_admin())
  WITH CHECK (company_id = public.get_auth_company_id() AND public.is_manager_or_admin());

-- ============================================================================
-- 3. CUSTOMERS & PROPERTIES (COMPANY SCOPED)
-- ============================================================================

ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS company_id UUID NULL REFERENCES public.companies(id);

UPDATE public.customers
SET company_id = (SELECT id FROM public.companies WHERE name = 'Madola Energy' LIMIT 1)
WHERE company_id IS NULL;

-- Customer RLS Updates
DROP POLICY IF EXISTS "Customers viewable by authenticated users" ON public.customers;
DROP POLICY IF EXISTS "Salespeople and Admins can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Salespeople can update their own created customers; Admins can update all" ON public.customers;
DROP POLICY IF EXISTS "Users can view their company customers" ON public.customers;
DROP POLICY IF EXISTS "Users can insert company customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their company customers" ON public.customers;

CREATE POLICY "Users can view their company customers"
  ON public.customers FOR SELECT
  TO authenticated
  USING (company_id = public.get_auth_company_id());

CREATE POLICY "Users can insert company customers"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = (SELECT auth.uid()) AND
    company_id = public.get_auth_company_id()
  );

CREATE POLICY "Users can update their company customers"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (company_id = public.get_auth_company_id())
  WITH CHECK (company_id = public.get_auth_company_id());

CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT NULL,
  city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  property_type TEXT NULL DEFAULT 'Residential Detached',
  roof_type TEXT NULL DEFAULT 'Pitched',
  roof_material TEXT NULL DEFAULT 'Concrete Tile',
  roof_pitch TEXT NULL DEFAULT '35 degrees',
  roof_direction TEXT NULL DEFAULT 'South',
  annual_energy_consumption NUMERIC NULL DEFAULT 4200,
  annual_energy_bill NUMERIC NULL DEFAULT 1450,
  electricity_supplier TEXT NULL DEFAULT 'Octopus Energy',
  tariff TEXT NULL DEFAULT 'Flexible Octopus',
  mpan TEXT NULL,
  smart_meter BOOLEAN NOT NULL DEFAULT true,
  three_phase BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_properties_customer ON public.properties(customer_id);

DROP POLICY IF EXISTS "Users can view company properties" ON public.properties;
CREATE POLICY "Users can view company properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = properties.customer_id
        AND c.company_id = public.get_auth_company_id()
    )
  );

DROP POLICY IF EXISTS "Users can insert company properties" ON public.properties;
CREATE POLICY "Users can insert company properties"
  ON public.properties FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = properties.customer_id
        AND c.company_id = public.get_auth_company_id()
    )
  );

DROP POLICY IF EXISTS "Users can update company properties" ON public.properties;
CREATE POLICY "Users can update company properties"
  ON public.properties FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = properties.customer_id
        AND c.company_id = public.get_auth_company_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = properties.customer_id
        AND c.company_id = public.get_auth_company_id()
    )
  );

-- ============================================================================
-- 4. PROPOSAL TEMPLATES & VERSIONS
-- ============================================================================

ALTER TABLE public.proposal_templates ADD COLUMN IF NOT EXISTS company_id UUID NULL REFERENCES public.companies(id);

UPDATE public.proposal_templates
SET company_id = (SELECT id FROM public.companies WHERE name = 'Madola Energy' LIMIT 1)
WHERE company_id IS NULL;

DROP POLICY IF EXISTS "Templates viewable by authenticated users" ON public.proposal_templates;
DROP POLICY IF EXISTS "Managers and Admins can manage templates" ON public.proposal_templates;

CREATE POLICY "Users can view their company templates"
  ON public.proposal_templates FOR SELECT
  TO authenticated
  USING (company_id = public.get_auth_company_id());

CREATE POLICY "Managers/Admins can manage their company templates"
  ON public.proposal_templates FOR ALL
  TO authenticated
  USING (
    company_id = public.get_auth_company_id() AND
    public.is_manager_or_admin()
  )
  WITH CHECK (
    company_id = public.get_auth_company_id() AND
    public.is_manager_or_admin()
  );

CREATE TABLE IF NOT EXISTS public.proposal_template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.proposal_templates(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unq_template_version UNIQUE (template_id, version)
);

ALTER TABLE public.proposal_template_versions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_proposal_template_versions_template ON public.proposal_template_versions(template_id);

DROP POLICY IF EXISTS "Users can view company template versions" ON public.proposal_template_versions;
CREATE POLICY "Users can view company template versions"
  ON public.proposal_template_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proposal_templates t
      WHERE t.id = proposal_template_versions.template_id
        AND t.company_id = public.get_auth_company_id()
    )
  );

DROP POLICY IF EXISTS "Managers/Admins can create company template versions" ON public.proposal_template_versions;
CREATE POLICY "Managers/Admins can create company template versions"
  ON public.proposal_template_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_manager_or_admin() AND
    EXISTS (
      SELECT 1 FROM public.proposal_templates t
      WHERE t.id = proposal_template_versions.template_id
        AND t.company_id = public.get_auth_company_id()
    )
  );

-- ============================================================================
-- 5. EXTEND PROPOSALS TABLE SAFELY & UPDATE RLS
-- ============================================================================

ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS company_id UUID NULL REFERENCES public.companies(id);
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS property_id UUID NULL REFERENCES public.properties(id);
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS template_version_id UUID NULL REFERENCES public.proposal_template_versions(id);
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS public_token TEXT UNIQUE NULL;

UPDATE public.proposals
SET company_id = (SELECT id FROM public.companies WHERE name = 'Madola Energy' LIMIT 1)
WHERE company_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_proposals_company ON public.proposals(company_id);
CREATE INDEX IF NOT EXISTS idx_proposals_public_token ON public.proposals(public_token);

DROP POLICY IF EXISTS "Proposals viewable by authenticated users" ON public.proposals;
DROP POLICY IF EXISTS "Salespeople and Admins can create proposals" ON public.proposals;
DROP POLICY IF EXISTS "Salespeople can update their own proposals; Managers/Admins can update all" ON public.proposals;
DROP POLICY IF EXISTS "Users can view their company proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can insert company proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can update their company proposals" ON public.proposals;

CREATE POLICY "Users can view their company proposals"
  ON public.proposals FOR SELECT
  TO authenticated
  USING (company_id = public.get_auth_company_id());

CREATE POLICY "Users can insert company proposals"
  ON public.proposals FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = (SELECT auth.uid()) AND
    company_id = public.get_auth_company_id()
  );

CREATE POLICY "Users can update their company proposals"
  ON public.proposals FOR UPDATE
  TO authenticated
  USING (company_id = public.get_auth_company_id())
  WITH CHECK (company_id = public.get_auth_company_id());

-- ============================================================================
-- 6. PROPOSAL VERSIONS (HISTORICAL SNAPSHOTS RLS HARMONISATION)
-- ============================================================================

DROP POLICY IF EXISTS "Proposal versions viewable by authenticated users" ON public.proposal_versions;
DROP POLICY IF EXISTS "Users can create proposal versions" ON public.proposal_versions;

CREATE POLICY "Users can view their company proposal versions"
  ON public.proposal_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_versions.proposal_id
        AND p.company_id = public.get_auth_company_id()
    )
  );

CREATE POLICY "Users can insert their company proposal versions"
  ON public.proposal_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = (SELECT auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_versions.proposal_id
        AND p.company_id = public.get_auth_company_id()
    )
  );

-- ============================================================================
-- 7. PROPOSAL BLOCKS (STRICT PROPOSAL & COMPANY SCOPING)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.proposal_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  block_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT true,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  conditions JSONB NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unq_proposal_block UNIQUE (proposal_id, block_id)
);

ALTER TABLE public.proposal_blocks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_proposal_blocks_proposal ON public.proposal_blocks(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_blocks_order ON public.proposal_blocks(proposal_id, order_index);

DROP POLICY IF EXISTS "Users can view company proposal blocks" ON public.proposal_blocks;
CREATE POLICY "Users can view company proposal blocks"
  ON public.proposal_blocks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_blocks.proposal_id
        AND p.company_id = public.get_auth_company_id()
    )
  );

DROP POLICY IF EXISTS "Users can insert company proposal blocks" ON public.proposal_blocks;
CREATE POLICY "Users can insert company proposal blocks"
  ON public.proposal_blocks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_blocks.proposal_id
        AND p.company_id = public.get_auth_company_id()
    )
  );

DROP POLICY IF EXISTS "Users can update company proposal blocks" ON public.proposal_blocks;
CREATE POLICY "Users can update company proposal blocks"
  ON public.proposal_blocks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_blocks.proposal_id
        AND p.company_id = public.get_auth_company_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_blocks.proposal_id
        AND p.company_id = public.get_auth_company_id()
    )
  );

DROP POLICY IF EXISTS "Users can delete company proposal blocks" ON public.proposal_blocks;
CREATE POLICY "Users can delete company proposal blocks"
  ON public.proposal_blocks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_blocks.proposal_id
        AND p.company_id = public.get_auth_company_id()
    )
  );

-- ============================================================================
-- 8. PROPOSAL PRODUCTS (PRODUCT PRICE SNAPSHOT AT PROPOSAL TIME)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.proposal_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  product_id UUID NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  included BOOLEAN NOT NULL DEFAULT true,
  custom_name TEXT NOT NULL,
  custom_description TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.proposal_products ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_proposal_products_proposal ON public.proposal_products(proposal_id);

DROP POLICY IF EXISTS "Users can view company proposal products" ON public.proposal_products;
CREATE POLICY "Users can view company proposal products"
  ON public.proposal_products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_products.proposal_id
        AND p.company_id = public.get_auth_company_id()
    )
  );

DROP POLICY IF EXISTS "Users can manage company proposal products" ON public.proposal_products;
CREATE POLICY "Users can manage company proposal products"
  ON public.proposal_products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_products.proposal_id
        AND p.company_id = public.get_auth_company_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_products.proposal_id
        AND p.company_id = public.get_auth_company_id()
    )
  );

-- ============================================================================
-- 9. PAYMENT MILESTONES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payment_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  percentage NUMERIC NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'Bank Transfer',
  description TEXT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_milestones ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_payment_milestones_proposal ON public.payment_milestones(proposal_id);

DROP POLICY IF EXISTS "Users can view company payment milestones" ON public.payment_milestones;
CREATE POLICY "Users can view company payment milestones"
  ON public.payment_milestones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = payment_milestones.proposal_id
        AND p.company_id = public.get_auth_company_id()
    )
  );

DROP POLICY IF EXISTS "Users can manage company payment milestones" ON public.payment_milestones;
CREATE POLICY "Users can manage company payment milestones"
  ON public.payment_milestones FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = payment_milestones.proposal_id
        AND p.company_id = public.get_auth_company_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = payment_milestones.proposal_id
        AND p.company_id = public.get_auth_company_id()
    )
  );

-- ============================================================================
-- 10. PROPOSAL ACCEPTANCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.proposal_acceptance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  customer_name TEXT NULL,
  customer_email TEXT NULL,
  accepted_at TIMESTAMPTZ NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.proposal_acceptance ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_proposal_acceptance_proposal ON public.proposal_acceptance(proposal_id);

DROP POLICY IF EXISTS "Users can view company proposal acceptance" ON public.proposal_acceptance;
CREATE POLICY "Users can view company proposal acceptance"
  ON public.proposal_acceptance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_acceptance.proposal_id
        AND p.company_id = public.get_auth_company_id()
    )
  );

DROP POLICY IF EXISTS "Users can manage company proposal acceptance" ON public.proposal_acceptance;
CREATE POLICY "Users can manage company proposal acceptance"
  ON public.proposal_acceptance FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_acceptance.proposal_id
        AND p.company_id = public.get_auth_company_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_acceptance.proposal_id
        AND p.company_id = public.get_auth_company_id()
    )
  );

-- ============================================================================
-- 11. MEDIA ASSETS (STRICT COMPANY SCOPED)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NULL REFERENCES public.companies(id),
  name TEXT NOT NULL,
  storage_path TEXT NULL,
  public_url TEXT NOT NULL,
  mime_type TEXT NULL DEFAULT 'image/png',
  file_size BIGINT NULL,
  type TEXT NOT NULL DEFAULT 'image',
  category TEXT NOT NULL DEFAULT 'general',
  alt TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_media_assets_company ON public.media_assets(company_id);

DROP POLICY IF EXISTS "Users can view company media assets" ON public.media_assets;
CREATE POLICY "Users can view company media assets"
  ON public.media_assets FOR SELECT
  TO authenticated
  USING (company_id = public.get_auth_company_id());

DROP POLICY IF EXISTS "Users can manage company media assets" ON public.media_assets;
CREATE POLICY "Users can manage company media assets"
  ON public.media_assets FOR ALL
  TO authenticated
  USING (company_id = public.get_auth_company_id())
  WITH CHECK (company_id = public.get_auth_company_id());
