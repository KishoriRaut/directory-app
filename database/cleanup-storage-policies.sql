-- ============================================
-- Clean Up Duplicate Storage Policies
-- ============================================
-- This script removes duplicate/conflicting policies
-- and keeps only the essential ones

-- Remove duplicate public access policies (keep only "Public Access - my-photo")
DROP POLICY IF EXISTS "Public can view my-photo images 13msyc1_0" ON storage.objects;

-- Remove duplicate authenticated policies (keep our custom ones)
DROP POLICY IF EXISTS "Authenticated users can upload to my-photo 13msyc1_0" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update my-photo 13msyc1_0" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update my-photo 13msyc1_1" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete my-photo 13msyc1_0" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete my-photo 13msyc1_1" ON storage.objects;

-- ============================================
-- Verify Essential Policies Exist
-- ============================================

-- Ensure public read policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public Access - my-photo'
  ) THEN
    CREATE POLICY "Public Access - my-photo" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'my-photo');
  END IF;
END $$;

-- Ensure authenticated upload policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated Upload - my-photo'
  ) THEN
    CREATE POLICY "Authenticated Upload - my-photo" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (
      bucket_id = 'my-photo' 
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;

-- ============================================
-- Final Verification
-- ============================================

-- Show remaining policies
SELECT 
  policyname,
  cmd as operation,
  qual as policy_definition,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%my-photo%'
ORDER BY policyname;

-- ============================================
-- Notes:
-- ============================================
-- After running this:
-- 1. You should have only 3-4 policies (no duplicates)
-- 2. "Public Access - my-photo" should allow anyone to view images
-- 3. Make sure the bucket is set to PUBLIC in Dashboard
-- 4. Test an image URL in a new browser tab
