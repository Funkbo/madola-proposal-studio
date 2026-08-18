-- ============================================================================
-- MIGRATION: PUBLIC PROPOSAL-IMAGES STORAGE BUCKET (hero + panel layout)
-- Images extracted from OpenSolar PDFs are uploaded here; proposals store URLs.
-- Bucket is public because the customer-facing proposal link itself is public.
-- ============================================================================

-- 1. Create public proposal-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proposal-images',
  'proposal-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png'];

-- 2. Storage INSERT Policy: Authenticated users can upload into their company folder
DROP POLICY IF EXISTS "Company members can upload proposal images" ON storage.objects;
CREATE POLICY "Company members can upload proposal images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'proposal-images' AND
    (storage.foldername(name))[1] = (
      SELECT company_id::text
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
      LIMIT 1
    )
  );

-- 3. Storage DELETE Policy: Company members can delete their own folder objects
DROP POLICY IF EXISTS "Company members can delete proposal images" ON storage.objects;
CREATE POLICY "Company members can delete proposal images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'proposal-images' AND
    (storage.foldername(name))[1] = (
      SELECT company_id::text
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
      LIMIT 1
    )
  );