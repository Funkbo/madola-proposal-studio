-- ============================================================================
-- Add Source Document Reference Columns to proposals Table
-- File: supabase/migrations/20260813010000_add_source_document_columns.sql
-- ============================================================================

ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS source_file_name TEXT NULL;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS source_storage_bucket TEXT NULL;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS source_storage_path TEXT NULL;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS source_file_size BIGINT NULL;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS source_mime_type TEXT NULL;
