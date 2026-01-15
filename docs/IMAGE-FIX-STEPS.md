# Image Not Fetching - Quick Fix Steps

## ✅ Database Status: Images Exist
Your database has valid image URLs:
- Format: `https://piulmultzreflltuqaxs.supabase.co/storage/v1/object/public/my-photo/profiles/...`
- URLs are correct Supabase storage URLs

## 🔍 Most Likely Issues

### Issue 1: Storage Bucket Not Public (Most Common)
**Check:**
1. Go to **Supabase Dashboard** → **Storage** → **Buckets**
2. Find `my-photo` bucket
3. Click on it → **Settings**
4. Check if **"Public bucket"** toggle is **ON**

**Fix:**
- If OFF, turn it ON
- This allows public access to images

### Issue 2: Storage RLS Policies Missing
**Check:**
- Run this in Supabase SQL Editor:
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%my-photo%';
```

**Fix:**
- If no policies found, run `database/storage-policies.sql`
- This creates the public read policy

### Issue 3: CORS Issues
**Check:**
- Open browser console (F12)
- Look for CORS errors when images try to load
- Check Network tab → see if image requests are failing

**Fix:**
- The code already handles CORS with blob URLs
- If still failing, check Supabase project CORS settings

## 🧪 Test Image URL Directly

1. Copy one of your image URLs from the database
2. Paste it in a new browser tab
3. **If it loads** → URL is correct, issue is in code
4. **If it doesn't load** → Storage bucket/policy issue

## 📋 Action Checklist

- [ ] Verify storage bucket is PUBLIC
- [ ] Run `database/storage-policies.sql` migration
- [ ] Test image URL directly in browser
- [ ] Check browser console for errors
- [ ] Restart dev server after changes

## 🔧 Code Changes Already Made

1. ✅ Explicit field selection (includes `image_url`)
2. ✅ Enhanced logging (shows image_url in console)
3. ✅ Multiple fallback checks (imageUrl, image_url, etc.)

## 🐛 Debug Steps

1. **Open browser console** (F12)
2. **Go to profile page**
3. **Look for these logs:**
   - `Initial fetch result:` → Check `hasImage_url` and `image_url_value`
   - `Mapping image_url from database to imageUrl:` → Check if mapping works
   - `Image failed to load:` → Check error details

4. **Check Network tab:**
   - Filter by "Img"
   - See if image requests are being made
   - Check response status (200 = success, 403/404 = access denied)

## 💡 Quick Test

Run this in browser console on profile page:
```javascript
// Check if image URL is in profile state
console.log('Profile:', profile)
console.log('Image URL:', profile?.imageUrl || profile?.image_url)
```

If the URL exists but image doesn't show, it's likely a storage bucket/policy issue.
