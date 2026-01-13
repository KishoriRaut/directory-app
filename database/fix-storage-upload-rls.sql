-- FIX FOR SUPABASE STORAGE UPLOAD RLS ERROR
-- ⚠️ PERMISSION WARNING: This script may fail with "must be owner of table objects"
-- 
-- If you get permission errors, use the Dashboard method instead:
-- See: STORAGE_FIX_DASHBOARD.md (RECOMMENDED - No SQL required!)
--
-- Alternative: Use fix-storage-upload-rls-service-role.sql with service_role key
--
-- Run this in Supabase Dashboard → SQL Editor
-- This will fix the "new row violates row-level security policy" error

-- STEP 1: Drop all existing policies on storage.objects
DROP POLICY IF EXISTS "Allow public image viewing" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated image uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Profile images are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can access storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow all authenticated operations" ON storage.objects;
DROP POLICY IF EXISTS "Allow all bucket access" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile images" ON storage.objects;

-- STEP 2: Ensure RLS is enabled (required for policies to work)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- STEP 3: Create comprehensive policies for the 'my-photo' bucket

-- Policy 1: Allow public SELECT (viewing) of images in my-photo bucket
CREATE POLICY "Public can view my-photo images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'my-photo');

-- Policy 2: Allow authenticated users to INSERT (upload) to my-photo bucket
CREATE POLICY "Authenticated users can upload to my-photo"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'my-photo' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow authenticated users to UPDATE files in my-photo bucket
CREATE POLICY "Authenticated users can update my-photo"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'my-photo' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'my-photo' 
  AND auth.role() = 'authenticated'
);

-- Policy 4: Allow authenticated users to DELETE files in my-photo bucket
CREATE POLICY "Authenticated users can delete my-photo"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'my-photo' 
  AND auth.role() = 'authenticated'
);

-- STEP 4: Verify policies were created
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%my-photo%'
ORDER BY policyname;

-- STEP 5: Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' 
  AND tablename = 'objects';

-- IMPORTANT NOTES:
-- 1. Make sure you're logged in as an authenticated user when testing uploads
-- 2. The bucket 'my-photo' must exist in your Supabase Storage
-- 3. If uploads still fail, check that:
--    - The bucket is set to "Public" in Storage settings
--    - Your user session is valid (check auth.getSession() in your code)
--    - The file path format matches: 'profiles/{userId}-{timestamp}.{ext}'
