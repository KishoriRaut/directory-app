# Image Fetching Troubleshooting Guide

## Problem: Photos are not fetching/displaying

### Quick Checks

1. **Check Browser Console**
   - Open DevTools (F12) → Console tab
   - Look for:
     - `Initial fetch result:` - Check `hasImage_url` and `image_url_value`
     - `Image failed to load:` - Check the error message
     - `Image loaded successfully:` - Confirms image is working

2. **Check Database**
   - Run the diagnostic query: `database/check-image-issue.sql`
   - Verify `image_url` column has data
   - Check if URLs are valid

3. **Check Storage Bucket**
   - Go to Supabase Dashboard → Storage → Buckets
   - Verify `my-photo` bucket exists
   - Verify bucket is **PUBLIC** (Settings → Public bucket: ON)
   - Run `database/storage-policies.sql` if not done

### Common Issues & Solutions

#### Issue 1: `image_url` is NULL in database
**Solution:**
- Upload a new image through the profile page
- Make sure to click "Save Changes" after uploading

#### Issue 2: Image URL exists but doesn't load
**Possible causes:**
- Storage bucket is not public
- Storage RLS policies are blocking access
- CORS issues

**Solution:**
1. Make bucket public: Storage → Buckets → my-photo → Settings → Public bucket: ON
2. Run `database/storage-policies.sql` migration
3. Check if URL is accessible: Open the `image_url` in a new browser tab

#### Issue 3: RLS policy blocking `image_url` field
**Solution:**
- The SELECT policy should allow reading all fields
- Current policy: `FOR SELECT USING (true)` - should work
- If you modified RLS policies, ensure they don't restrict field access

#### Issue 4: Image URL format is incorrect
**Check:**
- URL should start with `https://`
- URL should contain `supabase.co`
- Example: `https://[project].supabase.co/storage/v1/object/public/my-photo/profiles/[filename]`

### Diagnostic Steps

1. **Check what's in the database:**
   ```sql
   SELECT id, name, email, image_url 
   FROM professionals 
   WHERE email = 'your-email@example.com';
   ```

2. **Check if image_url is being fetched:**
   - Open browser console
   - Look for: `Initial fetch result:` log
   - Check `hasImage_url: true/false`
   - Check `image_url_value: [value]`

3. **Check if image URL is accessible:**
   - Copy the `image_url` value from console
   - Paste it in a new browser tab
   - If it loads → URL is correct, check component rendering
   - If it doesn't load → Storage bucket/policy issue

4. **Check component rendering:**
   - Look for: `Image failed to load:` in console
   - Check the `onError` handler logs
   - Verify `imageUrl` prop is being passed to `<img>` tag

### Code Changes Made

1. **Explicit field selection** - Changed from `select('*')` to explicit field list including `image_url`
2. **Enhanced logging** - Added detailed logs to track image_url through the fetch process
3. **Multiple fallbacks** - Code checks `imageUrl`, `image_url`, and other variations

### Next Steps

1. **Restart dev server** to apply code changes
2. **Check browser console** for the diagnostic logs
3. **Run diagnostic SQL** to check database state
4. **Verify storage bucket** is public and policies are set

If images still don't load after these steps, share the console logs and we can debug further.
