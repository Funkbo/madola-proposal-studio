-- ============================================================================
-- FIX RLS POLICIES FOR PUBLIC.COMPANY_BRANDING
-- Maintains strict company isolation: company_id = public.get_auth_company_id()
-- ============================================================================

ALTER TABLE public.company_branding ENABLE ROW LEVEL SECURITY;

-- 1. Drop old policies if existing
DROP POLICY IF EXISTS "Users can view their company branding" ON public.company_branding;
DROP POLICY IF EXISTS "Managers and Admins can insert/update their company branding" ON public.company_branding;
DROP POLICY IF EXISTS "Company members can view their company branding" ON public.company_branding;
DROP POLICY IF EXISTS "Company admins can modify their company branding" ON public.company_branding;
DROP POLICY IF EXISTS "Company members can view company branding" ON public.company_branding;
DROP POLICY IF EXISTS "Company admins can insert company branding" ON public.company_branding;
DROP POLICY IF EXISTS "Company admins can update company branding" ON public.company_branding;

-- 2. SELECT Policy: Authenticated users can view their own company branding
CREATE POLICY "Company members can view company branding"
  ON public.company_branding FOR SELECT
  TO authenticated
  USING (company_id = public.get_auth_company_id());

-- 3. INSERT Policy: Authenticated users can insert branding for their own company
CREATE POLICY "Company admins can insert company branding"
  ON public.company_branding FOR INSERT
  TO authenticated
  WITH CHECK (company_id = public.get_auth_company_id());

-- 4. UPDATE Policy: Authenticated users can update branding for their own company
CREATE POLICY "Company admins can update company branding"
  ON public.company_branding FOR UPDATE
  TO authenticated
  USING (company_id = public.get_auth_company_id())
  WITH CHECK (company_id = public.get_auth_company_id());
