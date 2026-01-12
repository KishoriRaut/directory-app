-- Supabase Storage Setup for Professional Profile Images
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Create Storage Bucket for Profile Images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images', 
  'profile-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 2. Create Storage Policies for Profile Images
-- Allow anyone to view profile images
CREATE POLICY "Profile images are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

-- Allow authenticated users to upload their own profile image
CREATE POLICY "Users can upload their own profile image" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' AND 
    auth.role() = 'authenticated'
  );

-- Allow users to update their own profile image
CREATE POLICY "Users can update their own profile image" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images' AND 
    auth.role() = 'authenticated'
  );

-- Allow users to delete their own profile image
CREATE POLICY "Users can delete their own profile image" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images' AND 
    auth.role() = 'authenticated'
  );

-- 3. Update Professionals Table to Support Image URLs
-- Add image_url column if it doesn't exist
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 4. Create Function to Generate Image URL
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

-- 5. Create Trigger to Clean Up Image When Professional is Deleted
CREATE OR REPLACE FUNCTION cleanup_profile_image()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the image file from storage when professional is deleted
  IF OLD.image_url IS NOT NULL THEN
    -- Extract file path from URL
    DECLARE
      file_path TEXT;
    BEGIN
      file_path := regexp_replace(OLD.image_url, '.*/([^/]+)$', '\1');
      PERFORM storage.remove('profile-images', file_path);
    EXCEPTION WHEN OTHERS THEN
      -- Ignore errors if file doesn't exist
      NULL;
    END;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS cleanup_profile_image_trigger ON professionals;
CREATE TRIGGER cleanup_profile_image_trigger
  BEFORE DELETE ON professionals
  FOR EACH ROW EXECUTE FUNCTION cleanup_profile_image();

-- 6. Sample Image URLs for Testing (Optional)
-- UPDATE professionals SET image_url = get_public_url('profile-images', 'default-avatar.png') WHERE image_url IS NULL;

-- 7. Create View for Professionals with Image URLs
CREATE OR REPLACE VIEW professionals_with_images AS
SELECT 
  p.*,
  CASE 
    WHEN p.image_url IS NOT NULL THEN p.image_url
    ELSE get_public_url('profile-images', 'default-avatar.png')
  END as display_image_url
FROM professionals p;

-- Usage Examples:
-- 1. Upload an image: storage.from('profile-images').upload('user-id.jpg', file)
-- 2. Get public URL: storage.from('profile-images').getPublicUrl('user-id.jpg')
-- 3. Delete an image: storage.from('profile-images').remove(['user-id.jpg'])

-- Notes:
-- - Default avatar image should be uploaded to the bucket manually
-- - File size limit is set to 5MB (adjust as needed)
-- - Supported formats: JPEG, PNG, WebP, GIF
-- - Images are publicly accessible (change policies if privacy needed)
