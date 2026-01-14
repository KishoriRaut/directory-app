-- ============================================
-- Migration: Enforce One Profile Per Email
-- ============================================
-- This ensures that each email address can only have ONE profile
-- Run this SQL in Supabase Dashboard → SQL Editor

-- Step 1: Check for duplicate emails (for information)
-- This will show you which emails have duplicates:
SELECT email, COUNT(*) as count, array_agg(id) as profile_ids
FROM professionals
GROUP BY email
HAVING COUNT(*) > 1;

-- Step 2: Show which profiles will be kept vs deleted (for verification)
-- Review this output before proceeding to Step 3
SELECT 
    email,
    id as profile_id,
    name,
    created_at,
    CASE 
        WHEN ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) = 1 
        THEN 'KEEP (Most Recent)'
        ELSE 'DELETE (Duplicate)'
    END as action
FROM professionals
WHERE email IN (
    SELECT email 
    FROM professionals 
    GROUP BY email 
    HAVING COUNT(*) > 1
)
ORDER BY email, created_at DESC;

-- Step 3: Clean up duplicates - Keep the most recent profile for each email
-- This will delete older duplicate profiles, keeping only the newest one
-- IMPORTANT: This merges services from deleted profiles into the kept profile
DO $$
DECLARE
    dup_record RECORD;
    kept_id UUID;
    deleted_ids UUID[];
    kept_name TEXT;
    deleted_count INT;
BEGIN
    -- Loop through all duplicate emails
    FOR dup_record IN 
        SELECT 
            email, 
            array_agg(id ORDER BY created_at DESC) as ids,
            array_agg(name ORDER BY created_at DESC) as names
        FROM professionals
        GROUP BY email
        HAVING COUNT(*) > 1
    LOOP
        -- Keep the first (most recent) profile
        kept_id := dup_record.ids[1];
        kept_name := dup_record.names[1];
        -- Get IDs of profiles to delete (all except the first)
        deleted_ids := dup_record.ids[2:array_length(dup_record.ids, 1)];
        deleted_count := array_length(deleted_ids, 1);
        
        -- Transfer services from deleted profiles to kept profile
        UPDATE services
        SET professional_id = kept_id
        WHERE professional_id = ANY(deleted_ids);
        
        -- Delete duplicate profiles (services are transferred, so CASCADE is safe)
        DELETE FROM professionals
        WHERE id = ANY(deleted_ids);
        
        RAISE NOTICE '✅ Email: % | Kept: % (%) | Deleted: % duplicate(s)', 
            dup_record.email, kept_name, kept_id, deleted_count;
    END LOOP;
    
    RAISE NOTICE '✅ Duplicate cleanup complete!';
END $$;

-- Step 3: Verify no duplicates remain
-- This should return 0 rows:
SELECT email, COUNT(*) as count
FROM professionals
GROUP BY email
HAVING COUNT(*) > 1;

-- Step 4: Drop existing constraint if it exists (in case of previous failed migration)
ALTER TABLE professionals 
DROP CONSTRAINT IF EXISTS professionals_email_unique;

-- Step 5: Add UNIQUE constraint on email column
-- This will prevent duplicate profiles for the same email in the future
ALTER TABLE professionals 
ADD CONSTRAINT professionals_email_unique UNIQUE (email);

-- Step 6: Create index for better performance (email lookups are common)
-- Note: The UNIQUE constraint automatically creates an index, but we can add this for clarity
CREATE INDEX IF NOT EXISTS idx_professionals_email ON professionals(email);

-- Step 7: Add comment for documentation
COMMENT ON CONSTRAINT professionals_email_unique ON professionals IS 
'Ensures each email address can only have one professional profile. This prevents duplicate profiles and maintains data integrity.';

-- ============================================
-- Migration Complete!
-- ============================================
-- Your database now enforces one profile per email.
-- Any duplicate profiles have been cleaned up (most recent kept).
-- Services from deleted profiles have been transferred to the kept profile.
