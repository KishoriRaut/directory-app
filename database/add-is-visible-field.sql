-- ============================================
-- Migration: Add is_visible field to professionals table
-- ============================================
-- This allows professionals to hide their profile from search results
-- Run this SQL in Supabase Dashboard → SQL Editor

-- Add is_visible column (defaults to true for existing profiles)
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE NOT NULL;

-- Create index for performance when filtering visible profiles
CREATE INDEX IF NOT EXISTS idx_professionals_is_visible ON professionals(is_visible);

-- Update RLS policy to only show visible profiles in public queries
-- Note: Users can still see their own profile even if hidden
DROP POLICY IF EXISTS "Professionals are viewable by everyone" ON professionals;

CREATE POLICY "Professionals are viewable by everyone" ON professionals
  FOR SELECT USING (
    is_visible = true 
    OR auth.uid()::text = id::text  -- Users can always see their own profile
  );

-- Add comment for documentation
COMMENT ON COLUMN professionals.is_visible IS 'Controls whether the profile appears in public search results. Users can always see their own profile.';
