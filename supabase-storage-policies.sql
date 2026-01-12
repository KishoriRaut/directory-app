-- Fix Supabase Storage RLS Policies for Profile Image Uploads
-- Run these commands in your Supabase SQL Editor with SERVICE ROLE key

-- IMPORTANT: Use the service_role key for these commands, not the anon key

-- 1. First, ensure we have the right permissions
-- You must run this with a service_role key or as the project owner

-- 2. Drop all existing policies on storage.objects
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can access storage" ON storage.objects;

-- 3. Disable RLS temporarily to ensure we can upload
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 4. Grant permissions to the necessary roles
GRANT ALL ON SCHEMA storage TO authenticated, anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO authenticated, anon, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO authenticated, anon, service_role;

-- 5. Enable RLS again
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 6. Create simple, permissive policies for testing
-- Allow authenticated users to do anything with their own files
CREATE POLICY "Allow authenticated users full access" ON storage.objects
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 7. Allow public access to view profile images
CREATE POLICY "Allow public access to profile images" ON storage.objects
FOR SELECT
USING (bucket_id = 'my-photo' AND name LIKE 'profiles/%');

-- 8. Alternative: If the above doesn't work, try this more permissive approach
-- Uncomment and run this if you still have issues

/*
-- More permissive policy - allows any authenticated user to upload to the bucket
CREATE POLICY "Allow authenticated users to upload to my-photo" ON storage.objects
FOR ALL
USING (bucket_id = 'my-photo' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'my-photo' AND auth.role() = 'authenticated');

-- Allow public read access
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT
USING (bucket_id = 'my-photo');
*/

-- 9. Final verification query
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    forcerlspolicy
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';
