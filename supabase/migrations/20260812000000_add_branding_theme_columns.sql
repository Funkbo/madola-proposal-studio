-- ============================================================================
-- ADD BRANDING THEME COLUMNS TO PUBLIC.COMPANY_BRANDING
-- ============================================================================

ALTER TABLE public.company_branding
  ADD COLUMN IF NOT EXISTS logo_path TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT DEFAULT 'Madola Energy',
  ADD COLUMN IF NOT EXISTS sidebar_background_color TEXT DEFAULT '#0b1428',
  ADD COLUMN IF NOT EXISTS sidebar_text_color TEXT DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS login_background_color TEXT DEFAULT '#f5f7f6',
  ADD COLUMN IF NOT EXISTS login_card_color TEXT DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS button_color TEXT DEFAULT '#10b981',
  ADD COLUMN IF NOT EXISTS button_text_color TEXT DEFAULT '#ffffff';

-- Ensure default Madola Energy company branding row exists
INSERT INTO public.company_branding (
  company_id,
  company_name,
  logo_path,
  logo_url,
  primary_color,
  secondary_color,
  sidebar_background_color,
  sidebar_text_color,
  login_background_color,
  login_card_color,
  button_color,
  button_text_color
)
SELECT
  id,
  'Madola Energy',
  'Madola-Right-logo-yJETPfnRlMe2UuUHxD0b0ziiUTpDCp.webp',
  '/storage/v1/object/public/company-branding/Madola-Right-logo-yJETPfnRlMe2UuUHxD0b0ziiUTpDCp.webp',
  '#10b981',
  '#0f172a',
  '#0b1428',
  '#ffffff',
  '#f5f7f6',
  '#ffffff',
  '#10b981',
  '#ffffff'
FROM public.companies
WHERE name = 'Madola Energy'
ON CONFLICT (company_id) DO NOTHING;
