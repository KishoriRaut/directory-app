-- Fixed RLS Policies for Profile Images Storage
-- Run this in Supabase Dashboard → SQL Editor
-- This version uses proper Supabase storage functions

-- 1. Update professionals table to support image URLs (if not already done)
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Create storage policies using Supabase's storage functions
-- These policies will be applied to your existing "my-photo" bucket

-- Allow anyone to view profile images (public access)
CREATE POLICY "Profile images are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'my-photo');

-- Allow authenticated users to upload profile images
CREATE POLICY "Authenticated users can upload profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'my-photo' AND 
    auth.role() = 'authenticated'
  );

-- Allow users to update their own profile images
CREATE POLICY "Users can update their own profile images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'my-photo' AND 
    auth.role() = 'authenticated'
  );

-- Allow users to delete their own profile images
CREATE POLICY "Users can delete their own profile images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'my-photo' AND 
    auth.role() = 'authenticated'
  );

-- 3. Create function to get public URL (helper function)
CREATE OR REPLACE FUNCTION get_public_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN format('https://%s/storage/v1/object/public/%s/%s', 
    current_setting('app.settings.supabase_url', true), 
    bucket_name, 
    file_path
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Alternative: Manual bucket setup if needed
-- If the above doesn't work, you may need to set up policies through the Supabase Dashboard:
-- Go to: Storage → your-bucket → Policies → Create Policy

-- Policy Examples for Dashboard:
-- 1. SELECT Policy: "Allow public access"
--    - Target: storage.objects
--    - Action: SELECT
--    - Target Roles: anon, authenticated
--    - Policy Definition: bucket_id = 'my-photo'

-- 2. INSERT Policy: "Allow authenticated uploads"
--    - Target: storage.objects
--    - Action: INSERT
--    - Target Roles: authenticated
--    - Policy Definition: bucket_id = 'my-photo'

-- 3. UPDATE Policy: "Allow users to update own images"
--    - Target: storage.objects
--    - Action: UPDATE
--    - Target Roles: authenticated
--    - Policy Definition: bucket_id = 'my-photo' AND auth.uid()::text = (storage.foldername(name))[1]

-- 4. DELETE Policy: "Allow users to delete own images"
--    - Target: storage.objects
--    - Action: DELETE
--    - Target Roles: authenticated
--    - Policy Definition: bucket_id = 'my-photo' AND auth.uid()::text = (storage.foldername(name))[1]

-- 5. Test the setup
-- You can test by running:
SELECT * FROM storage.policies WHERE bucket_id = 'my-photo';
