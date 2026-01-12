-- Working RLS Policies for "my-photo" bucket
-- Run this in Supabase Dashboard → SQL Editor

-- 1. First, drop all existing policies for the bucket
DROP POLICY IF EXISTS "Allow public image viewing" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated image uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Profile images are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- 2. Create working policies

-- Allow anyone to view images in the bucket
CREATE POLICY "Allow public image viewing" ON storage.objects
  FOR SELECT USING (bucket_id = 'my-photo');

-- Allow any authenticated user to upload images
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'my-photo' AND 
    auth.role() = 'authenticated'
  );

-- Allow any authenticated user to update images
CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'my-photo' AND 
    auth.role() = 'authenticated'
  );

-- Allow any authenticated user to delete images
CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'my-photo' AND 
    auth.role() = 'authenticated'
  );

-- 3. Alternative: If the above still doesn't work, try these more permissive policies

-- Allow all operations on the bucket for authenticated users
CREATE POLICY "Allow all authenticated operations" ON storage.objects
  FOR ALL USING (
    bucket_id = 'my-photo' AND 
    auth.role() = 'authenticated'
  ) WITH CHECK (
    bucket_id = 'my-photo' AND 
    auth.role() = 'authenticated'
  );

-- 4. If you're still getting errors, try this completely permissive approach
-- WARNING: This allows any authenticated user to access any file in the bucket

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Allow all authenticated operations" ON storage.objects;

-- Create a very permissive policy
CREATE POLICY "Allow all bucket access" ON storage.objects
  FOR ALL USING (bucket_id = 'my-photo')
  WITH CHECK (bucket_id = 'my-photo');

-- 5. Test query to check current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 6. If nothing works, you may need to disable RLS temporarily for testing
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
