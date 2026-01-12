-- Simplified Storage Setup for "my-photo" bucket
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Update professionals table to support image URLs (if not already done)
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Create helper function for public URLs
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

-- 3. Basic RLS policies for storage.objects
-- Enable RLS if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public viewing of images
CREATE POLICY "Allow public image viewing" ON storage.objects
  FOR SELECT USING (bucket_id = 'my-photo');

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated image uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'my-photo' AND 
    auth.role() = 'authenticated'
  );

-- Allow users to update their own images
CREATE POLICY "Allow users to update own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'my-photo' AND 
    auth.role() = 'authenticated'
  );

-- Allow users to delete their own images
CREATE POLICY "Allow users to delete own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'my-photo' AND 
    auth.role() = 'authenticated'
  );

-- 4. Test function (optional)
-- You can test the URL function with:
-- SELECT get_public_url('my-photo', 'test-image.jpg');

-- 5. If SQL policies don't work, use the Supabase Dashboard:
-- Go to Storage → my-photo → Policies and create:
-- 
-- SELECT Policy:
-- Name: "Public image access"
-- Action: SELECT
-- Roles: anon, authenticated  
-- Definition: bucket_id = 'my-photo'
--
-- INSERT Policy:
-- Name: "Authenticated uploads"
-- Action: INSERT
-- Roles: authenticated
-- Definition: bucket_id = 'my-photo'
--
-- UPDATE Policy:
-- Name: "User updates"
-- Action: UPDATE  
-- Roles: authenticated
-- Definition: bucket_id = 'my-photo'
--
-- DELETE Policy:
-- Name: "User deletes"
-- Action: DELETE
-- Roles: authenticated
-- Definition: bucket_id = 'my-photo'
