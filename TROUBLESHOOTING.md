# Troubleshooting Guide

## Issue 1: Image Not Showing / image_url is null

### Symptoms
- Console shows: `⚠️ image_url is null in database`
- Profile image doesn't display
- Image was uploaded but not saved

### Cause
The image was uploaded to Supabase Storage, but the URL wasn't saved to the database because:
1. **User didn't click "Save Changes"** - After uploading an image, you MUST click the "Save Changes" button to persist it to the database
2. The image URL is stored in `formData.imageUrl` but needs to be saved to `image_url` in the database

### Solution
1. **Upload the image** using the ImageUpload component
2. **Click "Save Changes"** button at the bottom of the form
3. The image URL will be saved to the `image_url` column in the database

### Visual Indicator
When an image is uploaded but not saved, you'll see a yellow warning box:
```
⚠️ IMPORTANT: Photo uploaded but not saved!
Click the "Save Changes" button below to save your photo to your profile.
```

## Issue 2: Profile Visibility Toggle Error (400 Error)

### Symptoms
- Error: `Failed to load resource: the server responded with a status of 400`
- Console shows: `Error updating visibility: Object`
- Toggle button doesn't work

### Cause
The `is_visible` column doesn't exist in the database yet. The migration hasn't been run.

### Solution
**Run the database migration:**

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Open the file: `database/add-is-visible-field.sql`
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click **Run**

The migration will:
- Add `is_visible` column (defaults to `true`)
- Create index for performance
- Update RLS policies

### After Migration
Once the migration is complete:
- The visibility toggle will work
- You can hide/show your profile from search results
- Hidden profiles won't appear in public searches

## Quick Fix Checklist

- [ ] **Image not showing?**
  - [ ] Did you click "Save Changes" after uploading?
  - [ ] Check if image URL is in formData (check console logs)
  - [ ] Verify image was uploaded to storage (check Supabase Storage)

- [ ] **Visibility toggle error?**
  - [ ] Run migration: `database/add-is-visible-field.sql`
  - [ ] Check Supabase Dashboard → Table Editor → professionals → verify `is_visible` column exists
  - [ ] Refresh the page after migration

## Still Having Issues?

1. **Check Browser Console** - Look for error messages
2. **Check Network Tab** - See if API calls are failing
3. **Verify Database Schema** - Ensure all columns exist
4. **Check RLS Policies** - Ensure policies allow updates

## Database Schema Verification

Run this in Supabase SQL Editor to check if columns exist:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'professionals'
AND column_name IN ('image_url', 'is_visible');
```

Expected result:
- `image_url` - TEXT, nullable
- `is_visible` - BOOLEAN, NOT NULL (after migration)
