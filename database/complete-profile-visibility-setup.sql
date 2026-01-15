-- ============================================
-- Complete Profile Visibility Setup
-- ============================================
-- This is a COMPLETE migration that sets up profile visibility functionality
-- Run this SQL in Supabase Dashboard → SQL Editor
-- This replaces and fixes all previous visibility-related migrations
-- ============================================

-- Step 1: Add is_visible column (defaults to true for existing profiles)
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE NOT NULL;

-- Step 2: Create index for performance when filtering visible profiles
CREATE INDEX IF NOT EXISTS idx_professionals_is_visible ON professionals(is_visible);

-- Step 3: Create security definer function to safely access auth user email
-- This function is used by both SELECT and UPDATE policies to match profiles by email
-- SECURITY DEFINER allows it to access auth.users table without permission issues
CREATE OR REPLACE FUNCTION auth_user_email()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- Step 4: Fix SELECT policy to show visible profiles + user's own profile
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Professionals are viewable by everyone" ON professionals;

-- Create SELECT policy that allows:
-- 1. Public profiles (is_visible = true) to be visible to everyone
-- 2. Users can always see their own profile (even if hidden) by email matching
CREATE POLICY "Professionals are viewable by everyone" ON professionals
  FOR SELECT USING (
    is_visible = true 
    OR email = auth_user_email()  -- Users can always see their own profile by email
  );

-- Step 5: Fix UPDATE policy to allow email-based updates (required for visibility toggle)
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can update own professionals" ON professionals;

-- Create UPDATE policy using the function (avoids permission issues)
-- This allows users to update their profile by matching email address
CREATE POLICY "Users can update own professionals" ON professionals
  FOR UPDATE USING (
    email = auth_user_email()
  )
  WITH CHECK (
    email = auth_user_email()
  );

-- Step 6: Add comments for documentation
COMMENT ON COLUMN professionals.is_visible IS 'Controls whether the profile appears in public search results. Users can always see their own profile.';
COMMENT ON FUNCTION auth_user_email() IS 'Security definer function that safely retrieves the authenticated user email. Used by RLS policies to match profiles by email address.';
COMMENT ON POLICY "Professionals are viewable by everyone" ON professionals IS 
  'Allows public access to visible profiles (is_visible = true) and allows users to see their own profile even if hidden. Uses email matching via auth_user_email() function.';
COMMENT ON POLICY "Users can update own professionals" ON professionals IS 
  'Allows authenticated users to update their own professional profile by matching email address. Uses security definer function to safely access auth.users table.';

-- ============================================
-- Verification Queries (Optional - run to verify)
-- ============================================
-- Check if column exists:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'professionals' AND column_name = 'is_visible';

-- Check if function exists:
-- SELECT routine_name, routine_type 
-- FROM information_schema.routines 
-- WHERE routine_name = 'auth_user_email';

-- Check policies:
-- SELECT policyname, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'professionals' 
-- ORDER BY policyname;
