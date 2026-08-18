-- ============================================================================
-- MIGRATION: proposal-media STORAGE BUCKET + MASTER TEMPLATE BLOCKS TABLE
-- 1. Creates the public proposal-media bucket used by uploadMediaAsset for
--    template images/videos (hero, advisor photo, gallery, accreditations).
-- 2. RLS policies mirroring proposal-images (company folder, public read).
-- 3. master_template_blocks table persists the master template so the
--    customer-facing page (anonymous) reflects template edits made in the
--    template editor.
-- ============================================================================

-- 1. Create public proposal-media bucket (images + videos, 25MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proposal-media',
  'proposal-media',
  true,
  26214400,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];

-- 2. Storage SELECT Policy: Public can read proposal media (bucket is public)
DROP POLICY IF EXISTS "Public can read proposal media" ON storage.objects;
CREATE POLICY "Public can read proposal media"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'proposal-media');

-- Storage SELECT Policy: Company members can read their own folder objects
DROP POLICY IF EXISTS "Company members can read proposal media" ON storage.objects;
CREATE POLICY "Company members can read proposal media"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'proposal-media' AND
    (storage.foldername(name))[1] = (
      SELECT company_id::text
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
      LIMIT 1
    )
  );

-- Storage INSERT Policy: Authenticated users can upload into their company folder
DROP POLICY IF EXISTS "Company members can upload proposal media" ON storage.objects;
CREATE POLICY "Company members can upload proposal media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'proposal-media' AND
    (storage.foldername(name))[1] = (
      SELECT company_id::text
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
      LIMIT 1
    )
  );

-- Storage UPDATE Policy: Company members can update their own folder objects
DROP POLICY IF EXISTS "Company members can update proposal media" ON storage.objects;
CREATE POLICY "Company members can update proposal media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'proposal-media' AND
    (storage.foldername(name))[1] = (
      SELECT company_id::text
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
      LIMIT 1
    )
  );

-- Storage DELETE Policy: Company members can delete their own folder objects
DROP POLICY IF EXISTS "Company members can delete proposal media" ON storage.objects;
CREATE POLICY "Company members can delete proposal media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'proposal-media' AND
    (storage.foldername(name))[1] = (
      SELECT company_id::text
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
      LIMIT 1
    )
  );

-- ============================================================================
-- 3. Master template blocks table (persists the template the customer page
--    falls back to when a proposal has no saved blocks)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.master_template_blocks (
  id text PRIMARY KEY,
  blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.master_template_blocks ENABLE ROW LEVEL SECURITY;

-- Public can read the master template blocks (customer page is anonymous)
DROP POLICY IF EXISTS "Public can read master template blocks" ON public.master_template_blocks;
CREATE POLICY "Public can read master template blocks"
  ON public.master_template_blocks FOR SELECT
  TO public
  USING (true);

-- Authenticated users can upsert the master template blocks
DROP POLICY IF EXISTS "Authenticated users can upsert master template blocks" ON public.master_template_blocks;
CREATE POLICY "Authenticated users can upsert master template blocks"
  ON public.master_template_blocks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);