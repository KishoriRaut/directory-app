# Supabase Storage Policy Setup Guide

## How to Add Public Access Policy for `my-photo` Bucket

### Step 1: Access Supabase Dashboard
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Storage** in the left sidebar

### Step 2: Make Bucket Public
1. Click on **Storage** → **Buckets**
2. Find the `my-photo` bucket
3. Click on the bucket name
4. In the bucket settings, ensure **Public bucket** is **enabled** (toggle it ON)
   - If it's private, click the toggle to make it public

### Step 3: Add RLS Policy for Public Read Access

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to **Storage** → **Policies** (or click on `my-photo` bucket → **Policies** tab)
2. Click **New Policy**
3. Choose **Create a policy from scratch**
4. Configure the policy:
   - **Policy name**: `Public Access` or `Allow Public Read`
   - **Allowed operation**: Select **SELECT** (for reading/downloading)
   - **Policy definition**: Use this SQL:
   ```sql
   bucket_id = 'my-photo'
   ```
   - **Policy check**: Leave empty (for public access)
   - **Policy with check**: Leave empty

5. Click **Review** then **Save policy**

#### Option B: Using SQL Editor (Alternative)

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Paste this SQL:

```sql
-- Allow public read access to my-photo bucket
CREATE POLICY "Public Access" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'my-photo');
```

4. Click **Run** to execute

**OR** use the complete SQL file: `database/storage-policies.sql` (includes all policies)

### Step 4: Verify the Policy

1. Go back to **Storage** → **Policies**
2. You should see the new policy listed
3. The policy should show:
   - **Name**: Public Access (or your chosen name)
   - **Operation**: SELECT
   - **Target roles**: public (or authenticated)

### Step 5: Test the Image URL

1. Copy an image URL from your application (from console logs)
2. Paste it in a new browser tab
3. The image should load directly
4. If it loads, the policy is working correctly!

## Troubleshooting

### If images still don't load:

1. **Check bucket is public**:
   - Storage → Buckets → `my-photo` → Settings
   - Ensure "Public bucket" toggle is ON

2. **Check policy exists**:
   - Storage → Policies
   - Look for a policy with `bucket_id = 'my-photo'` and operation `SELECT`

3. **Check policy is enabled**:
   - Make sure the policy toggle is ON (not disabled)

4. **Verify RLS is enabled**:
   - Storage → Settings
   - Row Level Security should be enabled for storage.objects

5. **Test URL directly**:
   - Open the image URL in a new browser tab
   - If it doesn't load, the bucket/policy configuration is the issue
   - If it loads, the issue is in the application code

## Complete Policy SQL (for reference)

If you need to recreate the policy, use this complete SQL:

```sql
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Create new public read policy
CREATE POLICY "Public Access" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'my-photo');
```

## Additional Policies (if needed)

If you also need to allow authenticated users to upload:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated Upload" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'my-photo' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own files
CREATE POLICY "User Update Own Files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'my-photo' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Notes

- The `storage.objects` table is a system table that Supabase uses for all storage buckets
- Policies on `storage.objects` apply to all buckets, so you must filter by `bucket_id = 'my-photo'`
- Public buckets still need RLS policies for SELECT operations
- The policy `USING (bucket_id = 'my-photo')` ensures it only applies to your specific bucket
