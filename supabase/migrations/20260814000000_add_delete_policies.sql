-- Add DELETE RLS Policies for Proposals and Linked Tables

-- 1. Proposals DELETE Policy
DROP POLICY IF EXISTS "Authenticated users and owners can delete proposals" ON public.proposals;
CREATE POLICY "Authenticated users and owners can delete proposals"
  ON public.proposals FOR DELETE
  USING (true);

-- 2. Customers DELETE Policy
DROP POLICY IF EXISTS "Authenticated users can delete customers" ON public.customers;
CREATE POLICY "Authenticated users can delete customers"
  ON public.customers FOR DELETE
  USING (true);

-- 3. Solar Systems DELETE Policy
DROP POLICY IF EXISTS "Authenticated users can delete solar_systems" ON public.solar_systems;
CREATE POLICY "Authenticated users can delete solar_systems"
  ON public.solar_systems FOR DELETE
  USING (true);

-- 4. Financials DELETE Policy
DROP POLICY IF EXISTS "Authenticated users can delete financials" ON public.financials;
CREATE POLICY "Authenticated users can delete financials"
  ON public.financials FOR DELETE
  USING (true);

-- 5. Proposal Products DELETE Policy
DROP POLICY IF EXISTS "Authenticated users can delete proposal_products" ON public.proposal_products;
CREATE POLICY "Authenticated users can delete proposal_products"
  ON public.proposal_products FOR DELETE
  USING (true);

-- 6. Proposal Acceptance DELETE Policy
DROP POLICY IF EXISTS "Authenticated users can delete proposal_acceptance" ON public.proposal_acceptance;
CREATE POLICY "Authenticated users can delete proposal_acceptance"
  ON public.proposal_acceptance FOR DELETE
  USING (true);

-- 7. Proposal Blocks DELETE Policy
DROP POLICY IF EXISTS "Authenticated users can delete proposal_blocks" ON public.proposal_blocks;
CREATE POLICY "Authenticated users can delete proposal_blocks"
  ON public.proposal_blocks FOR DELETE
  USING (true);

-- 8. Payment Milestones DELETE Policy
DROP POLICY IF EXISTS "Authenticated users can delete payment_milestones" ON public.payment_milestones;
CREATE POLICY "Authenticated users can delete payment_milestones"
  ON public.payment_milestones FOR DELETE
  USING (true);
