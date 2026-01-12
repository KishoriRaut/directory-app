# Fix Supabase Storage RLS - Dashboard Solution

## 🚨 QUICK FIX - Use Supabase Dashboard (Recommended)

Since SQL permissions are causing issues, use the dashboard approach:

### Step 1: Go to Supabase Dashboard
1. Navigate to https://supabase.com/dashboard
2. Select your project

### Step 2: Access Storage Settings
1. Click on **Storage** in the left sidebar
2. Click on **Buckets**
3. Select the **`my-photo`** bucket (or create it if it doesn't exist)

### Step 3: Disable RLS
1. Click on **Settings** tab for the bucket
2. Find **Row Level Security** toggle
3. **Turn OFF** RLS completely
4. Click **Save**

### Step 4: Verify Bucket Settings
1. In bucket settings, ensure:
   - **Public** access is enabled
   - **File size limit** is appropriate (e.g., 5MB)
   - **Allowed MIME types** include image types

### Step 5: Test Upload
1. Go back to your app
2. Try uploading a profile image
3. Should work immediately now

### Step 6: (Optional) Re-enable with Proper Policies Later
Once uploads work, you can:
1. Turn RLS back on
2. Use the Policy Builder to create proper policies
3. Test again

## 🔧 Alternative: Service Role SQL

If you must use SQL, you need the **service_role** key:

1. Go to Project Settings → API
2. Copy the **service_role** key (not the anon key)
3. Use this key in your SQL client
4. Run the `fix-storage-rls-complete.sql` script

## 📋 What's Happening

The error occurs because:
- RLS policies are blocking INSERT operations
- The file path format is correct: `profiles/userid-timestamp.png`
- We need to either disable RLS or fix the policies
- Dashboard approach is more reliable than SQL for permissions

## ✅ Expected Result

After disabling RLS:
- No more "row-level security policy" errors
- Uploads should work immediately
- Images will be accessible via public URLs
- Console should show successful upload

## 🔍 Verification

Check the console for:
- ✅ No RLS violation errors
- ✅ Successful upload messages
- ✅ Image URLs being generated correctly

The dashboard approach is the most reliable solution for this issue!
