# Fix Storage Upload RLS - Dashboard Method (NO SQL REQUIRED)

## 🚨 You're Getting Permission Errors?

If you see: `ERROR: 42501: must be owner of table objects`

**Don't worry!** You can't modify storage policies directly with SQL in Supabase. Use the Dashboard instead - it's easier and more reliable.

## ✅ Step-by-Step Dashboard Fix

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Make sure you're logged in as the project owner

### Step 2: Create/Verify the Bucket
1. Click **Storage** in the left sidebar
2. Click **Buckets**
3. Check if `my-photo` bucket exists
   - **If it exists**: Click on it
   - **If it doesn't exist**: 
     - Click **New bucket**
     - Name: `my-photo`
     - **Enable "Public bucket"** (important!)
     - Click **Create bucket**

### Step 3: Configure Bucket Settings
1. Click on the `my-photo` bucket
2. Go to **Settings** tab
3. Ensure these settings:
   - ✅ **Public bucket**: Enabled
   - ✅ **File size limit**: 5MB or higher
   - ✅ **Allowed MIME types**: Leave empty (allows all) OR add: `image/jpeg, image/png, image/webp, image/gif`

### Step 4: Set Up Policies (This is the key step!)

1. Go to the **Policies** tab in the bucket
2. You'll see a list of policies (or empty if none exist)

3. **Delete all existing policies** (if any):
   - Click the trash icon next to each policy
   - Confirm deletion

4. **Create Policy 1: Public View**
   - Click **New Policy**
   - Choose **"For full customization"**
   - Policy name: `Public can view my-photo images`
   - Allowed operation: **SELECT**
   - Target roles: Check both `anon` and `authenticated`
   - Policy definition (USING expression):
     ```sql
     bucket_id = 'my-photo'
     ```
   - Click **Review** then **Save policy**

5. **Create Policy 2: Authenticated Upload**
   - Click **New Policy** again
   - Choose **"For full customization"**
   - Policy name: `Authenticated users can upload to my-photo`
   - Allowed operation: **INSERT**
   - Target roles: Check `authenticated` only
   - Policy definition (WITH CHECK expression):
     ```sql
     bucket_id = 'my-photo'
     ```
   - Click **Review** then **Save policy**

6. **Create Policy 3: Authenticated Update**
   - Click **New Policy**
   - Choose **"For full customization"**
   - Policy name: `Authenticated users can update my-photo`
   - Allowed operation: **UPDATE**
   - Target roles: Check `authenticated` only
   - Policy definition (USING expression):
     ```sql
     bucket_id = 'my-photo'
     ```
   - Policy definition (WITH CHECK expression):
     ```sql
     bucket_id = 'my-photo'
     ```
   - Click **Review** then **Save policy**

7. **Create Policy 4: Authenticated Delete**
   - Click **New Policy**
   - Choose **"For full customization"**
   - Policy name: `Authenticated users can delete my-photo`
   - Allowed operation: **DELETE**
   - Target roles: Check `authenticated` only
   - Policy definition (USING expression):
     ```sql
     bucket_id = 'my-photo'
     ```
   - Click **Review** then **Save policy**

### Step 5: Verify Policies
You should now see 4 policies:
1. ✅ Public can view my-photo images (SELECT)
2. ✅ Authenticated users can upload to my-photo (INSERT)
3. ✅ Authenticated users can update my-photo (UPDATE)
4. ✅ Authenticated users can delete my-photo (DELETE)

### Step 6: Test Upload
1. Go back to your app
2. Make sure you're logged in
3. Try uploading a profile image
4. The error should be gone! 🎉

## 🔍 Quick Policy Builder Method (Easier)

If the above seems complicated, Supabase has a Policy Builder:

1. Go to **Storage** → **Buckets** → **my-photo** → **Policies**
2. Click **New Policy**
3. Choose **"Get started quickly"** or use the template:
   - Template: **"Allow public access"** (for SELECT)
   - Template: **"Allow authenticated uploads"** (for INSERT)
   - Template: **"Allow authenticated updates"** (for UPDATE)
   - Template: **"Allow authenticated deletes"** (for DELETE)

4. For each template, make sure:
   - Bucket is set to `my-photo`
   - Roles are correct (anon + authenticated for SELECT, authenticated only for others)

## 🐛 Still Not Working?

### Check 1: Are you logged in?
- The upload requires authentication
- Check your app's auth state
- Try logging out and back in

### Check 2: Bucket is Public?
- Go to Storage → Buckets → my-photo → Settings
- **Public bucket** must be enabled
- If it's not, enable it and save

### Check 3: Policy Syntax
- Make sure the policy definition is exactly: `bucket_id = 'my-photo'`
- No extra spaces or quotes
- Use single quotes around 'my-photo'

### Check 4: Try Disabling RLS Temporarily
If nothing works, you can temporarily disable RLS:
1. Go to Storage → Buckets → my-photo → Settings
2. Look for **Row Level Security** toggle
3. Turn it OFF (for testing only!)
4. Test upload
5. If it works, turn RLS back ON and re-check your policies

## ✅ Expected Result

After setting up policies:
- ✅ No more "row-level security policy" errors
- ✅ Uploads complete successfully
- ✅ Console shows "Upload successful"
- ✅ Images are accessible via public URLs

## 📝 Notes

- The Dashboard method is the **recommended** way to manage storage policies
- SQL method requires service_role key which is not recommended for security
- Policies take effect immediately after saving
- You can test policies using the "Test policy" button in the Dashboard
