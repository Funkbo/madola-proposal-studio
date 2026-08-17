-- ============================================================================
-- SECURE PUBLIC BRANDING RPC FOR UNAUTHENTICATED /LOGIN
-- Exposes ONLY minimum public-safe fields without opening company_branding RLS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_public_company_branding()
RETURNS TABLE (
  company_name TEXT,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  login_background_color TEXT,
  login_card_color TEXT,
  button_color TEXT,
  button_text_color TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cb.company_name,
    cb.logo_url,
    cb.primary_color,
    cb.secondary_color,
    cb.login_background_color,
    cb.login_card_color,
    cb.button_color,
    cb.button_text_color
  FROM public.company_branding cb
  WHERE cb.company_id = '5c813b60-7b97-47c1-9457-11f98adfb9b7'
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_company_branding() TO anon, authenticated;
