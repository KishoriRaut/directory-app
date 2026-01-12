-- Simple Fix: Disable RLS for Storage Objects
-- This will allow uploads to work immediately

-- Disable RLS on storage.objects table
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Grant permissions to all roles
GRANT ALL ON SCHEMA storage TO authenticated, anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO authenticated, anon, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO authenticated, anon, service_role;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    forcerlspolicy
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';
