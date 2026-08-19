-- ============================================================================
-- STAGE 2: FIX PUBLIC PROPOSAL RPC & ACCEPTANCE CONSTRAINTS
-- - Aligns company_branding columns so get_public_proposal() stops 400ing
-- - Adds heroImage/layoutImage to the public proposal payload
-- - Allows 'accepted' status on proposals
-- - Adds UNIQUE(proposal_id) so accept_public_proposal() ON CONFLICT works
-- ============================================================================

-- 1. Guarantee company_branding columns referenced by the public RPC exist
--    (live DB created these out-of-band as logo_url / contact_email /
--     contact_phone / office_address; fresh DBs may have the older set).
ALTER TABLE public.company_branding ADD COLUMN IF NOT EXISTS logo_reference TEXT NULL;
ALTER TABLE public.company_branding ADD COLUMN IF NOT EXISTS email TEXT NULL;
ALTER TABLE public.company_branding ADD COLUMN IF NOT EXISTS phone TEXT NULL;
ALTER TABLE public.company_branding ADD COLUMN IF NOT EXISTS address TEXT NULL;
ALTER TABLE public.company_branding ADD COLUMN IF NOT EXISTS logo_url TEXT NULL;
ALTER TABLE public.company_branding ADD COLUMN IF NOT EXISTS contact_email TEXT NULL;
ALTER TABLE public.company_branding ADD COLUMN IF NOT EXISTS contact_phone TEXT NULL;
ALTER TABLE public.company_branding ADD COLUMN IF NOT EXISTS office_address TEXT NULL;

-- 2. Allow 'accepted' (and 'declined') on proposals so online acceptance works
ALTER TABLE public.proposals DROP CONSTRAINT IF EXISTS proposals_status_check;
ALTER TABLE public.proposals ADD CONSTRAINT proposals_status_check
  CHECK (status IN ('draft', 'review_required', 'approved', 'published', 'accepted', 'declined'));

-- 3. UNIQUE(proposal_id) enables ON CONFLICT upsert in accept_public_proposal()
ALTER TABLE public.proposal_acceptance ADD CONSTRAINT unq_proposal_acceptance_proposal UNIQUE (proposal_id);

-- ============================================================================
-- 4. REWRITE get_public_proposal()
--    Uses the company_branding columns that actually exist and exposes
--    heroImage / layoutImage / branding / acceptance so the customer page
--    renders DB data without falling back to localStorage or hardcoded values.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_public_proposal(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_proposal RECORD;
  v_customer RECORD;
  v_solar RECORD;
  v_financial RECORD;
  v_blocks JSONB;
  v_products JSONB;
  v_milestones JSONB;
  v_acceptance RECORD;
  v_branding RECORD;
  v_result JSONB;
BEGIN
  IF p_token IS NULL OR trim(p_token) = '' THEN
    RETURN jsonb_build_object('error', 'token_invalid', 'message', 'Invalid proposal link.');
  END IF;

  -- Query proposal record by public_token
  SELECT * INTO v_proposal
  FROM public.proposals
  WHERE public_token = p_token;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'not_found', 'message', 'Proposal not found or link has changed.');
  END IF;

  -- Expiry Check
  IF v_proposal.expires_at IS NOT NULL AND v_proposal.expires_at < now() THEN
    RETURN jsonb_build_object(
      'error', 'expired',
      'message', 'This proposal link has expired. Please contact your Madola Energy advisor for an updated quote.',
      'reference', v_proposal.reference,
      'expires_at', v_proposal.expires_at
    );
  END IF;

  -- Draft Check: Do NOT expose draft proposals publicly
  IF v_proposal.status = 'draft' THEN
    RETURN jsonb_build_object('error', 'draft_unpublished', 'message', 'This proposal is currently being prepared and has not been published yet.');
  END IF;

  -- Query linked customer
  SELECT first_name, last_name, email, phone, address_line_1, address_line_2, city, postcode
  INTO v_customer
  FROM public.customers
  WHERE id = v_proposal.customer_id;

  -- Query solar system specs
  SELECT system_size_kwp, panel_count, panel_wattage, panel_manufacturer, panel_model,
         inverter_manufacturer, inverter_model, inverter_capacity_kw,
         battery_manufacturer, battery_model, battery_capacity_kwh,
         annual_generation_kwh, annual_consumption_kwh, self_consumption_percent, self_sufficiency_percent, export_kwh
  INTO v_solar
  FROM public.solar_systems
  WHERE proposal_id = v_proposal.id;

  -- Query financials
  SELECT system_price, vat, deposit, annual_saving, lifetime_saving, payback_years, electricity_rate, export_rate, inflation_rate
  INTO v_financial
  FROM public.financials
  WHERE proposal_id = v_proposal.id;

  -- Query proposal blocks (only enabled blocks, ordered)
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'id', block_id,
      'type', type,
      'title', title,
      'order', order_index,
      'enabled', enabled,
      'data', data,
      'conditions', conditions
    ) ORDER BY order_index ASC
  ), '[]'::jsonb) INTO v_blocks
  FROM public.proposal_blocks
  WHERE proposal_id = v_proposal.id AND enabled = true;

  -- Query proposal products
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'productId', product_id,
      'quantity', quantity,
      'unitPrice', unit_price,
      'included', included,
      'customName', custom_name,
      'customDescription', custom_description
    )
  ), '[]'::jsonb) INTO v_products
  FROM public.proposal_products
  WHERE proposal_id = v_proposal.id;

  -- Query payment milestones
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'label', label,
      'percentage', percentage,
      'amount', amount,
      'paymentMethod', payment_method,
      'description', description
    ) ORDER BY order_index ASC
  ), '[]'::jsonb) INTO v_milestones
  FROM public.payment_milestones
  WHERE proposal_id = v_proposal.id;

  -- Query acceptance state
  SELECT status, customer_name, customer_email, accepted_at, notes
  INTO v_acceptance
  FROM public.proposal_acceptance
  WHERE proposal_id = v_proposal.id;

  -- Query company branding (column-agnostic: reads whichever set exists)
  SELECT
    coalesce(cb.company_name, 'Madola Energy') AS company_name,
    coalesce(cb.logo_url, cb.logo_reference) AS logo_url,
    cb.primary_color,
    cb.secondary_color,
    coalesce(cb.contact_email, cb.email) AS email,
    coalesce(cb.contact_phone, cb.phone) AS phone,
    cb.website,
    coalesce(cb.office_address, cb.address) AS address
  INTO v_branding
  FROM public.company_branding cb
  WHERE cb.company_id = v_proposal.company_id;

  -- Build final sanitized presentation payload
  v_result := jsonb_build_object(
    'status', 'success',
    'proposal', jsonb_build_object(
      'id', v_proposal.id,
      'reference', v_proposal.reference,
      'status', v_proposal.status,
      'publishedAt', v_proposal.published_at,
      'expiresAt', v_proposal.expires_at,
      'heroImage', v_proposal.hero_image_url,
      'layoutImage', v_proposal.layout_image_url,
      'customer', jsonb_build_object(
        'name', coalesce(v_customer.first_name || ' ' || v_customer.last_name, 'Client'),
        'email', coalesce(v_customer.email, ''),
        'phone', coalesce(v_customer.phone, ''),
        'address', coalesce(v_customer.address_line_1, ''),
        'postcode', coalesce(v_customer.postcode, '')
      ),
      'solarSystem', to_jsonb(v_solar),
      'financials', to_jsonb(v_financial),
      'blocks', v_blocks,
      'products', v_products,
      'paymentSchedule', v_milestones,
      'acceptance', to_jsonb(v_acceptance),
      'branding', to_jsonb(v_branding)
    )
  );

  RETURN v_result;
END;
$$;

-- ============================================================================
-- 5. REWRITE accept_public_proposal()
--    Anonymous-safe: updates proposal status + upserts acceptance row.
--    Requires the UNIQUE(proposal_id) constraint added above.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.accept_public_proposal(
  p_token TEXT,
  p_signer_name TEXT DEFAULT NULL,
  p_signer_email TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_proposal RECORD;
BEGIN
  IF p_token IS NULL OR trim(p_token) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid public token.');
  END IF;

  SELECT id, status, expires_at, public_token INTO v_proposal
  FROM public.proposals
  WHERE public_token = p_token;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Proposal not found.');
  END IF;

  IF v_proposal.status = 'draft' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Draft proposals cannot be accepted.');
  END IF;

  IF v_proposal.expires_at IS NOT NULL AND v_proposal.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'This proposal link has expired.');
  END IF;

  -- Update proposals table status
  UPDATE public.proposals
  SET status = 'accepted',
      updated_at = now()
  WHERE id = v_proposal.id;

  -- Upsert proposal_acceptance record
  INSERT INTO public.proposal_acceptance (proposal_id, status, customer_name, customer_email, accepted_at, notes)
  VALUES (
    v_proposal.id,
    'accepted',
    coalesce(p_signer_name, 'Client'),
    coalesce(p_signer_email, ''),
    now(),
    p_notes
  )
  ON CONFLICT (proposal_id)
  DO UPDATE SET
    status = 'accepted',
    customer_name = coalesce(EXCLUDED.customer_name, proposal_acceptance.customer_name),
    customer_email = coalesce(EXCLUDED.customer_email, proposal_acceptance.customer_email),
    accepted_at = now(),
    notes = EXCLUDED.notes,
    updated_at = now();

  RETURN jsonb_build_object('success', true, 'message', 'Proposal accepted successfully.');
END;
$$;

-- Grant EXECUTE permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_public_proposal(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.accept_public_proposal(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
