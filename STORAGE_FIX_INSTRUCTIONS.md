# Fix Storage Upload RLS Error

## 🚨 Quick Fix Steps

You're getting this error:
```
StorageApiError: new row violates row-level security policy
```

This means the Row Level Security (RLS) policies on your Supabase storage bucket are blocking the upload.

## ✅ Solution

### ⭐ Option 1: Use Dashboard (RECOMMENDED - Easiest!)

**If you got a permission error with SQL, use this method instead!**

See: **`STORAGE_FIX_DASHBOARD.md`** for step-by-step instructions using the Supabase Dashboard UI.

This is the easiest and most reliable method - no SQL required!

### Option 2: Run SQL Script (May require permissions)

1. **Go to Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Run the Fix Script**
   - Open the file: `database/fix-storage-upload-rls.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)

4. **Verify the Fix**
   - The script will show you the policies that were created
   - You should see 4 policies for the 'my-photo' bucket

5. **Test Upload**
   - Go back to your app
   - Try uploading a profile image again
   - The error should be gone!

### Option 2: Use Dashboard (Alternative)

If SQL doesn't work, use the dashboard:

1. **Go to Storage → Buckets**
   - Click on **Storage** in left sidebar
   - Click on **Buckets**
   - Find or create the **`my-photo`** bucket

2. **Configure Bucket**
   - Click on the **`my-photo`** bucket
   - Go to **Settings** tab
   - Ensure **Public bucket** is enabled
   - Set appropriate file size limits

3. **Set Up Policies**
   - Go to **Policies** tab
   - Click **New Policy**
   - Create these policies:

   **Policy 1: Public View**
   - Name: "Public can view my-photo images"
   - Action: SELECT
   - Roles: anon, authenticated
   - Definition: `bucket_id = 'my-photo'`

   **Policy 2: Authenticated Upload**
   - Name: "Authenticated users can upload to my-photo"
   - Action: INSERT
   - Roles: authenticated
   - Definition: `bucket_id = 'my-photo'`

   **Policy 3: Authenticated Update**
   - Name: "Authenticated users can update my-photo"
   - Action: UPDATE
   - Roles: authenticated
   - Definition: `bucket_id = 'my-photo'`

   **Policy 4: Authenticated Delete**
   - Name: "Authenticated users can delete my-photo"
   - Action: DELETE
   - Roles: authenticated
   - Definition: `bucket_id = 'my-photo'`

## 🔍 Verify Your Setup

### Check Authentication
Make sure you're logged in when testing:
- The code checks for a session before uploading
- If you're not logged in, you'll get an error

### Check Bucket Exists
1. Go to Storage → Buckets
2. Verify `my-photo` bucket exists
3. If it doesn't exist, create it:
   - Click **New bucket**
   - Name: `my-photo`
   - Make it **Public**
   - Click **Create bucket**

### Check File Path Format
The code uses this format:
```
profiles/{userId}-{timestamp}.{ext}
```

This is correct and should work with the policies.

## 🐛 Still Not Working?

If you're still getting errors after running the SQL script:

1. **Check Console Logs**
   - Look for "Uploading to bucket: my-photo"
   - Look for "File path: profiles/..."
   - Check if there are any other error messages

2. **Verify Session**
   - Add this to your code temporarily:
   ```typescript
   const { data: { session } } = await supabase.auth.getSession()
   console.log('Session:', session)
   ```
   - Make sure session is not null

3. **Check Bucket Permissions**
   - Go to Storage → Buckets → my-photo → Settings
   - Ensure "Public bucket" is enabled
   - Check file size limits

4. **Try Disabling RLS Temporarily** (for testing only)
   - Run this in SQL Editor:
   ```sql
   ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
   ```
   - Test upload
   - If it works, re-enable RLS and check policies again

## ✅ Expected Result

After applying the fix:
- ✅ No more "row-level security policy" errors
- ✅ Uploads complete successfully
- ✅ Console shows "Upload successful"
- ✅ Public URL is generated correctly
