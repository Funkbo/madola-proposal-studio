-- ============================================================================
-- STAGE 3: HERO / LAYOUT IMAGE SOURCE TRACKING
-- - Tracks where a proposal's hero & layout images come from so Master
--   Template changes only propagate to proposals that still use the template
--   image (source = 'template'), never clobbering per-proposal custom or
--   OpenSolar-extracted images.
--   Sources: 'template' (inherits from Master Template) | 'custom' (explicit
--   per-proposal override) | 'extracted' (auto-derived from the OpenSolar PDF)
-- - Extends get_public_proposal() to expose heroSource / layoutSource so the
--   customer page resolves images with the same priority used at creation.
-- - Adds propagate_template_images() which safely pushes a newly saved Master
--   Template hero/layout into ONLY the template-source proposals + their blocks.
-- ============================================================================

-- 1. Add source-tracking columns (default 'template' for fresh rows)
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS hero_source TEXT NOT NULL DEFAULT 'template';
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS layout_source TEXT NOT NULL DEFAULT 'template';

DO $$
BEGIN
  ALTER TABLE public.proposals DROP CONSTRAINT IF EXISTS proposals_hero_source_check;
  ALTER TABLE public.proposals ADD CONSTRAINT proposals_hero_source_check
    CHECK (hero_source IN ('template', 'custom', 'extracted'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.proposals DROP CONSTRAINT IF EXISTS proposals_layout_source_check;
  ALTER TABLE public.proposals ADD CONSTRAINT proposals_layout_source_check
    CHECK (layout_source IN ('template', 'custom', 'extracted'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Backfill existing rows: persisted images live in the proposal-images
--    bucket (uploaded by persistProposalImage from base64/PDF extraction), so
--    they are classified 'extracted' and protected from template propagation.
UPDATE public.proposals
SET hero_source = 'extracted'
WHERE hero_image_url IS NOT NULL
  AND (hero_image_url LIKE '%/proposal-images/%' OR hero_image_url LIKE 'data:%')
  AND hero_source = 'template';

UPDATE public.proposals
SET layout_source = 'extracted'
WHERE layout_image_url IS NOT NULL
  AND (layout_image_url LIKE '%/proposal-images/%' OR layout_image_url LIKE 'data:%')
  AND layout_source = 'template';

-- ============================================================================
-- 3. REWRITE get_public_proposal() to also expose heroSource / layoutSource
--    (identical to the Stage 2 function, with the two extra payload fields).
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
      'heroSource', v_proposal.hero_source,
      'layoutSource', v_proposal.layout_source,
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
-- 4. propagate_template_images()
--    Pushes a newly saved Master Template hero/layout into ONLY the proposals
--    whose hero/layout source is still 'template' (plus their cover /
--    panel-layout blocks). Custom and extracted proposal images are untouched.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.propagate_template_images(
  p_hero_image TEXT DEFAULT NULL,
  p_layout_image TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hero_updated INT := 0;
  v_layout_updated INT := 0;
BEGIN
  IF p_hero_image IS NOT NULL THEN
    UPDATE public.proposals
    SET hero_image_url = p_hero_image,
        updated_at = now()
    WHERE hero_source = 'template';
    GET DIAGNOSTICS v_hero_updated = ROW_COUNT;

    UPDATE public.proposal_blocks pb
    SET data = jsonb_set(coalesce(pb.data, '{}'::jsonb), '{heroImage}', to_jsonb(p_hero_image))
    FROM public.proposals p
    WHERE pb.proposal_id = p.id
      AND p.hero_source = 'template'
      AND pb.type = 'cover';
  END IF;

  IF p_layout_image IS NOT NULL THEN
    UPDATE public.proposals
    SET layout_image_url = p_layout_image,
        updated_at = now()
    WHERE layout_source = 'template';
    GET DIAGNOSTICS v_layout_updated = ROW_COUNT;

    UPDATE public.proposal_blocks pb
    SET data = jsonb_set(coalesce(pb.data, '{}'::jsonb), '{layoutImage}', to_jsonb(p_layout_image))
    FROM public.proposals p
    WHERE pb.proposal_id = p.id
      AND p.layout_source = 'template'
      AND pb.type = 'panel_layout';
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'heroUpdated', v_hero_updated,
    'layoutUpdated', v_layout_updated
  );
END;
$$;

-- Grant EXECUTE permission: authenticated users only (admin template saves).
GRANT EXECUTE ON FUNCTION public.get_public_proposal(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.propagate_template_images(TEXT, TEXT) TO authenticated;