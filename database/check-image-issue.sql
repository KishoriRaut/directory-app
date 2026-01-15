-- ============================================
-- Diagnostic Query: Check Image URL Issues
-- ============================================
-- Run this in Supabase Dashboard → SQL Editor to diagnose image fetching issues

-- 1. Check if image_url column exists and has data
SELECT 
  id,
  name,
  email,
  image_url,
  CASE 
    WHEN image_url IS NULL THEN 'NULL'
    WHEN image_url = '' THEN 'EMPTY STRING'
    WHEN image_url LIKE 'https://%' THEN 'VALID URL'
    ELSE 'INVALID FORMAT'
  END as image_status,
  LENGTH(image_url) as url_length
FROM professionals
WHERE image_url IS NOT NULL
LIMIT 10;

-- 2. Check RLS policies for professionals table
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'professionals' 
  AND schemaname = 'public';

-- 3. Check if storage bucket exists and is public
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE name = 'my-photo';

-- 4. Check storage policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%my-photo%';

-- 5. Check if any profiles have image_url but it's not accessible
SELECT 
  p.id,
  p.name,
  p.email,
  p.image_url,
  CASE 
    WHEN p.image_url LIKE '%supabase.co%' THEN 'SUPABASE URL'
    WHEN p.image_url LIKE 'http%' THEN 'EXTERNAL URL'
    ELSE 'OTHER'
  END as url_type
FROM professionals p
WHERE p.image_url IS NOT NULL 
  AND p.image_url != ''
LIMIT 20;
