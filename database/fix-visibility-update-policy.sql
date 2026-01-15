-- ============================================
-- Migration: Fix Profile Visibility Update Policy
-- ============================================
-- This fixes the RLS UPDATE policy to allow users to update their profile visibility
-- The original policy requires auth.uid() = id, but profiles use random UUIDs
-- This version uses email matching without directly accessing auth.users table
-- Run this SQL in Supabase Dashboard → SQL Editor

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Users can update own professionals" ON professionals;

-- Create UPDATE policy that allows updates based on email matching
-- This uses a function to safely access auth user email without direct table access
CREATE POLICY "Users can update own professionals" ON professionals
  FOR UPDATE USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Alternative approach if the above still gives permission errors:
-- Use a security definer function to safely check email
CREATE OR REPLACE FUNCTION auth_user_email()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- If the direct query doesn't work, use this policy instead:
-- DROP POLICY IF EXISTS "Users can update own professionals" ON professionals;
-- CREATE POLICY "Users can update own professionals" ON professionals
--   FOR UPDATE USING (
--     email = auth_user_email()
--   )
--   WITH CHECK (
--     email = auth_user_email()
--   );

-- Add comment for documentation
COMMENT ON POLICY "Users can update own professionals" ON professionals IS 
  'Allows authenticated users to update their own professional profile by matching email address. This enables profile visibility toggles and other profile updates.';
