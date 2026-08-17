-- ============================================================================
-- Supabase Storage Setup: proposal-pdfs bucket and RLS policies
-- File: supabase/migrations/20260813000000_proposal_pdfs_storage_bucket.sql
-- ============================================================================

-- 1. Create proposal-pdfs bucket in storage.buckets if missing
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proposal-pdfs',
  'proposal-pdfs',
  true,
  26214400, -- 25MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY['application/pdf'];

-- 2. Storage RLS Policies for proposal-pdfs bucket
DROP POLICY IF EXISTS "Authenticated users can upload proposal pdfs" ON storage.objects;
CREATE POLICY "Authenticated users can upload proposal pdfs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'proposal-pdfs');

DROP POLICY IF EXISTS "Authenticated users can read proposal pdfs" ON storage.objects;
CREATE POLICY "Authenticated users can read proposal pdfs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'proposal-pdfs');

DROP POLICY IF EXISTS "Public can read proposal pdfs" ON storage.objects;
CREATE POLICY "Public can read proposal pdfs"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'proposal-pdfs');

DROP POLICY IF EXISTS "Authenticated users can update proposal pdfs" ON storage.objects;
CREATE POLICY "Authenticated users can update proposal pdfs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'proposal-pdfs');

DROP POLICY IF EXISTS "Authenticated users can delete proposal pdfs" ON storage.objects;
CREATE POLICY "Authenticated users can delete proposal pdfs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'proposal-pdfs');
