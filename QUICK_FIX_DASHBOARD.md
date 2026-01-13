# 🚨 QUICK FIX - Use Dashboard (SQL Won't Work)

You're getting permission errors because you can't modify `storage.objects` with SQL. **Use the Dashboard instead** - it's actually easier!

## ✅ 5-Minute Fix Using Dashboard

### Step 1: Open Your Bucket
1. Go to **Supabase Dashboard** → https://supabase.com/dashboard
2. Select your project
3. Click **Storage** (left sidebar)
4. Click **Buckets**
5. Click on **`my-photo`** bucket (or create it if missing)

### Step 2: Make Bucket Public
1. Click **Settings** tab
2. Enable **"Public bucket"** toggle
3. Click **Save**

### Step 3: Create Policies (4 policies needed)

Go to the **Policies** tab, then create these 4 policies:

---

#### **Policy 1: Public View**
1. Click **New Policy**
2. Click **"For full customization"**
3. Fill in:
   - **Policy name**: `Public can view my-photo images`
   - **Allowed operation**: `SELECT`
   - **Target roles**: Check ✅ `anon` and ✅ `authenticated`
   - **USING expression**: 
     ```sql
     bucket_id = 'my-photo'
     ```
4. Click **Review** → **Save policy**

---

#### **Policy 2: Authenticated Upload**
1. Click **New Policy**
2. Click **"For full customization"**
3. Fill in:
   - **Policy name**: `Authenticated users can upload to my-photo`
   - **Allowed operation**: `INSERT`
   - **Target roles**: Check ✅ `authenticated` only
   - **WITH CHECK expression**:
     ```sql
     bucket_id = 'my-photo'
     ```
4. Click **Review** → **Save policy**

---

#### **Policy 3: Authenticated Update**
1. Click **New Policy**
2. Click **"For full customization"**
3. Fill in:
   - **Policy name**: `Authenticated users can update my-photo`
   - **Allowed operation**: `UPDATE`
   - **Target roles**: Check ✅ `authenticated` only
   - **USING expression**:
     ```sql
     bucket_id = 'my-photo'
     ```
   - **WITH CHECK expression**:
     ```sql
     bucket_id = 'my-photo'
     ```
4. Click **Review** → **Save policy**

---

#### **Policy 4: Authenticated Delete**
1. Click **New Policy**
2. Click **"For full customization"**
3. Fill in:
   - **Policy name**: `Authenticated users can delete my-photo`
   - **Allowed operation**: `DELETE`
   - **Target roles**: Check ✅ `authenticated` only
   - **USING expression**:
     ```sql
     bucket_id = 'my-photo'
     ```
4. Click **Review** → **Save policy**

---

### Step 4: Verify
You should now see **4 policies** in the Policies tab:
- ✅ Public can view my-photo images (SELECT)
- ✅ Authenticated users can upload to my-photo (INSERT)
- ✅ Authenticated users can update my-photo (UPDATE)
- ✅ Authenticated users can delete my-photo (DELETE)

### Step 5: Test
1. Go back to your app
2. Make sure you're **logged in**
3. Try uploading an image
4. **Error should be gone!** 🎉

---

## 🎯 Even Easier: Use Policy Templates

If the above seems complicated, Supabase has templates:

1. Go to **Policies** tab
2. Click **New Policy**
3. Choose **"Get started quickly"**
4. Use these templates:

   - **Template**: "Allow public access"
     - Operation: SELECT
     - Bucket: my-photo
     - Roles: anon, authenticated
   
   - **Template**: "Allow authenticated uploads"
     - Operation: INSERT
     - Bucket: my-photo
     - Roles: authenticated
   
   - **Template**: "Allow authenticated updates"
     - Operation: UPDATE
     - Bucket: my-photo
     - Roles: authenticated
   
   - **Template**: "Allow authenticated deletes"
     - Operation: DELETE
     - Bucket: my-photo
     - Roles: authenticated

---

## ❓ Still Having Issues?

### Check 1: Are you logged in?
- Uploads require authentication
- Check your app's login state

### Check 2: Bucket exists and is public?
- Storage → Buckets → my-photo → Settings
- "Public bucket" must be ON

### Check 3: Policy syntax
- Make sure it's exactly: `bucket_id = 'my-photo'`
- Use single quotes, no extra spaces

---

**That's it!** The Dashboard method is the recommended way and avoids all permission errors. 🚀
