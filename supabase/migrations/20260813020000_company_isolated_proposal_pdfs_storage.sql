-- ============================================================================
-- Company-Isolated Storage Setup & RLS Policies for proposal-pdfs Bucket
-- File: supabase/migrations/20260813020000_company_isolated_proposal_pdfs_storage.sql
-- ============================================================================

-- 1. Ensure private proposal-pdfs bucket exists in storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proposal-pdfs',
  'proposal-pdfs',
  false, -- Private bucket (NOT public)
  26214400, -- 25MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY['application/pdf'];

-- 2. Storage INSERT Policy: Authenticated users can insert objects into their company folder
DROP POLICY IF EXISTS "Company members can upload proposal pdfs" ON storage.objects;
CREATE POLICY "Company members can upload proposal pdfs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'proposal-pdfs' AND
    (storage.foldername(name))[1] = (
      SELECT company_id::text
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
      LIMIT 1
    )
  );

-- 3. Storage SELECT Policy: Authenticated users can read objects from their company folder
DROP POLICY IF EXISTS "Company members can read proposal pdfs" ON storage.objects;
CREATE POLICY "Company members can read proposal pdfs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'proposal-pdfs' AND
    (storage.foldername(name))[1] = (
      SELECT company_id::text
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
      LIMIT 1
    )
  );

-- 4. Storage UPDATE Policy: Authenticated users can update objects in their company folder
DROP POLICY IF EXISTS "Company members can update proposal pdfs" ON storage.objects;
CREATE POLICY "Company members can update proposal pdfs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'proposal-pdfs' AND
    (storage.foldername(name))[1] = (
      SELECT company_id::text
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
      LIMIT 1
    )
  )
  WITH CHECK (
    bucket_id = 'proposal-pdfs' AND
    (storage.foldername(name))[1] = (
      SELECT company_id::text
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
      LIMIT 1
    )
  );

-- 5. Storage DELETE Policy: Authenticated users can delete objects from their company folder
DROP POLICY IF EXISTS "Company members can delete proposal pdfs" ON storage.objects;
CREATE POLICY "Company members can delete proposal pdfs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'proposal-pdfs' AND
    (storage.foldername(name))[1] = (
      SELECT company_id::text
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
      LIMIT 1
    )
  );
