-- ============================================================================
-- MIGRATION: ADD READ POLICIES FOR proposal-images BUCKET
-- The storage service performs an existence check (SELECT) before upsert
-- writes; the bucket is public, so mirror the proposal-pdfs read policies.
-- ============================================================================

-- Storage SELECT Policy: Public can read proposal images (bucket is public)
DROP POLICY IF EXISTS "Public can read proposal images" ON storage.objects;
CREATE POLICY "Public can read proposal images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'proposal-images');

-- Storage SELECT Policy: Company members can read their own folder objects
DROP POLICY IF EXISTS "Company members can read proposal images" ON storage.objects;
CREATE POLICY "Company members can read proposal images"
  ON storage.objects FOR SELECT
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