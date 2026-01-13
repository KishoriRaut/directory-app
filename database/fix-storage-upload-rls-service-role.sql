-- FIX FOR SUPABASE STORAGE UPLOAD RLS ERROR
-- ⚠️ IMPORTANT: This script requires SERVICE_ROLE key
-- ⚠️ DO NOT use service_role key in client-side code!
-- 
-- How to use:
-- 1. Go to Supabase Dashboard → Settings → API
-- 2. Copy the SERVICE_ROLE key (not the anon key!)
-- 3. Use a SQL client that supports custom headers
-- 4. Set header: apikey: YOUR_SERVICE_ROLE_KEY
-- 5. OR use Supabase Dashboard SQL Editor with service role
--
-- ⚠️ SECURITY WARNING: Service role key bypasses all RLS!
-- Only use this for administrative tasks, never expose it in client code.

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
DROP POLICY IF EXISTS "Public can view my-photo images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to my-photo" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update my-photo" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete my-photo" ON storage.objects;

-- STEP 2: Ensure RLS is enabled
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

-- ✅ DONE! Policies are now set up correctly.
-- 
-- IMPORTANT REMINDERS:
-- 1. Make sure you're logged in as an authenticated user when testing uploads
-- 2. The bucket 'my-photo' must exist and be set to Public
-- 3. If you still have issues, use the Dashboard method instead (see STORAGE_FIX_DASHBOARD.md)
