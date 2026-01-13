-- ============================================
-- COPY AND PASTE THIS ENTIRE SCRIPT
-- Fix Storage Upload RLS Error
-- ============================================

-- Step 1: Drop all existing policies
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

-- Step 2: Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 3: Create Policy 1 - Public can view images
CREATE POLICY "Public can view my-photo images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'my-photo');

-- Step 4: Create Policy 2 - Authenticated users can upload
CREATE POLICY "Authenticated users can upload to my-photo"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'my-photo' 
  AND auth.role() = 'authenticated'
);

-- Step 5: Create Policy 3 - Authenticated users can update
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

-- Step 6: Create Policy 4 - Authenticated users can delete
CREATE POLICY "Authenticated users can delete my-photo"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'my-photo' 
  AND auth.role() = 'authenticated'
);

-- Step 7: Verify policies were created
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

-- ✅ DONE! If you see 4 policies above, you're all set!
