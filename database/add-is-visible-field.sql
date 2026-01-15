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

-- Create SELECT policy that allows:
-- 1. Public profiles (is_visible = true) to be visible to everyone
-- 2. Users can always see their own profile (even if hidden) by email matching
CREATE POLICY "Professionals are viewable by everyone" ON professionals
  FOR SELECT USING (
    is_visible = true 
    OR email = auth_user_email()  -- Users can always see their own profile by email
  );

-- Create a security definer function to safely access auth user email
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

-- Fix UPDATE policy to allow email-based updates (required for visibility toggle)
-- The original policy requires auth.uid() = id, but profiles use random UUIDs

-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Users can update own professionals" ON professionals;

-- Create UPDATE policy using the function (avoids permission issues)
CREATE POLICY "Users can update own professionals" ON professionals
  FOR UPDATE USING (
    email = auth_user_email()
  )
  WITH CHECK (
    email = auth_user_email()
  );

-- Add comment for documentation
COMMENT ON COLUMN professionals.is_visible IS 'Controls whether the profile appears in public search results. Users can always see their own profile.';
COMMENT ON POLICY "Users can update own professionals" ON professionals IS 
  'Allows authenticated users to update their own professional profile by matching email address. Uses security definer function to safely access auth.users table.';
