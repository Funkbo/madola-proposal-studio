-- ============================================================================
-- STAGE 2: ADD REQUIRED RLS INSERT/SELECT POLICIES FOR CHILD TABLES
-- solar_systems / financials only had DELETE policies, so
-- saveInteractiveProposal() could never persist rows for them.
-- Mirrors the company-scoped policies already present on proposal_products.
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'solar_systems' AND policyname = 'Users can manage company solar systems'
  ) THEN
    CREATE POLICY "Users can manage company solar systems" ON public.solar_systems
      FOR ALL
      USING (
        EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = solar_systems.proposal_id AND p.company_id = get_auth_company_id())
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = solar_systems.proposal_id AND p.company_id = get_auth_company_id())
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'solar_systems' AND policyname = 'Users can view company solar systems'
  ) THEN
    CREATE POLICY "Users can view company solar systems" ON public.solar_systems
      FOR SELECT
      USING (
        EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = solar_systems.proposal_id AND p.company_id = get_auth_company_id())
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'financials' AND policyname = 'Users can manage company financials'
  ) THEN
    CREATE POLICY "Users can manage company financials" ON public.financials
      FOR ALL
      USING (
        EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = financials.proposal_id AND p.company_id = get_auth_company_id())
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = financials.proposal_id AND p.company_id = get_auth_company_id())
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'financials' AND policyname = 'Users can view company financials'
  ) THEN
    CREATE POLICY "Users can view company financials" ON public.financials
      FOR SELECT
      USING (
        EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = financials.proposal_id AND p.company_id = get_auth_company_id())
      );
  END IF;
END
$$;