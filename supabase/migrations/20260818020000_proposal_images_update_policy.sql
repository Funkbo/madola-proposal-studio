-- ============================================================================
-- MIGRATION: ADD UPDATE POLICY FOR proposal-images BUCKET
-- The storage service uses INSERT ... ON CONFLICT DO UPDATE for x-upsert
-- uploads; without an UPDATE policy those fail RLS. Mirrors proposal-pdfs.
-- ============================================================================

-- Storage UPDATE Policy: Authenticated users can update objects in their company folder
DROP POLICY IF EXISTS "Company members can update proposal images" ON storage.objects;
CREATE POLICY "Company members can update proposal images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'proposal-images' AND
    (storage.foldername(name))[1] = (
      SELECT company_id::text
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
      LIMIT 1
    )
  )
  WITH CHECK (
    bucket_id = 'proposal-images' AND
    (storage.foldername(name))[1] = (
      SELECT company_id::text
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
      LIMIT 1
    )
  );