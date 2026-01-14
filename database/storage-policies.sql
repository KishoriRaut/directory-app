-- ============================================
-- Supabase Storage Policies for my-photo Bucket
-- ============================================
-- Run this SQL in Supabase Dashboard → SQL Editor
-- This will create the necessary policies for public image access

-- Step 1: Ensure the bucket exists and is public
-- (Do this manually in Dashboard: Storage → Buckets → my-photo → Make Public)

-- Step 2: Create public read policy for my-photo bucket
-- This allows anyone to view/download images from the bucket

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Public Access - my-photo" ON storage.objects;

-- Create public read access policy
CREATE POLICY "Public Access - my-photo" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'my-photo');

-- Step 3: Allow authenticated users to upload images
-- This allows logged-in users to upload profile photos

DROP POLICY IF EXISTS "Authenticated Upload - my-photo" ON storage.objects;

CREATE POLICY "Authenticated Upload - my-photo" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'my-photo' 
  AND auth.role() = 'authenticated'
);

-- Step 4: Allow users to update their own uploaded files
-- This allows users to replace their profile photos

DROP POLICY IF EXISTS "User Update Own Files - my-photo" ON storage.objects;

CREATE POLICY "User Update Own Files - my-photo" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'my-photo' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Step 5: Allow users to delete their own uploaded files
-- This allows users to remove their profile photos

DROP POLICY IF EXISTS "User Delete Own Files - my-photo" ON storage.objects;

CREATE POLICY "User Delete Own Files - my-photo" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'my-photo' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- Verification Queries
-- ============================================

-- Check if policies were created successfully
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%my-photo%';

-- ============================================
-- Notes:
-- ============================================
-- 1. Make sure the 'my-photo' bucket exists in Storage
-- 2. Set the bucket to PUBLIC in Storage → Buckets → my-photo → Settings
-- 3. The policies above will allow:
--    - Anyone to READ (view/download) images
--    - Authenticated users to UPLOAD images
--    - Authenticated users to UPDATE their own images
--    - Authenticated users to DELETE their own images
--
-- 4. File path structure: profiles/{userId}-{timestamp}.{ext}
--    Example: profiles/a230b776-68fc-4a54-9b78-0894afae9c23-1768319578316.jpg
--
-- 5. The UPDATE and DELETE policies check that the file is in a folder
--    named with the user's UUID, which matches our upload structure
