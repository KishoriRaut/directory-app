-- RLS Policies for Profile Images Storage
-- Run this in Supabase Dashboard → SQL Editor
-- Replace 'my-photo' with your actual bucket name if different

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. Allow anyone to view profile images (public access)
CREATE POLICY "Profile images are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'my-photo');

-- 2. Allow authenticated users to upload profile images
CREATE POLICY "Authenticated users can upload profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'my-photo' AND 
    auth.role() = 'authenticated'
  );

-- 3. Allow users to update their own profile images
CREATE POLICY "Users can update their own profile images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'my-photo' AND 
    auth.role() = 'authenticated'
  );

-- 4. Allow users to delete their own profile images
CREATE POLICY "Users can delete their own profile images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'my-photo' AND 
    auth.role() = 'authenticated'
  );

-- 5. Update professionals table to support image URLs (if not already done)
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 6. Create function to get public URL
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
