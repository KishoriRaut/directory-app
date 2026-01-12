# Siscora Connect - Supabase Database Setup Instructions

## 🚀 Quick Setup Guide

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Connect your GitHub account or create new account
4. Create a new project named "siscora-connect"

### 2. Set Up Environment Variables
Copy these values from your Supabase project settings:

```bash
# In your .env.local file:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Database Schema
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `database/schema.sql`
3. Click "Run" to execute the schema

### 4. Add Sample Data (Optional)
1. In the same SQL Editor
2. Copy and paste the contents of `database/seed-data.sql`
3. Click "Run" to add sample professionals

### 5. Set Up Storage for Avatars
1. Go to Supabase Dashboard → Storage
2. Create a new bucket named "avatars"
3. Set bucket to public access
4. Configure CORS settings if needed

## 📊 Database Schema Overview

### Tables Created:
- **categories** - Professional categories (Doctor, Engineer, etc.)
- **professionals** - Main professional profiles
- **services** - Services offered by each professional
- **reviews** - Customer reviews and ratings

### Key Features:
- ✅ Row Level Security (RLS) enabled
- ✅ UUID primary keys for security
- ✅ Indexes for performance
- ✅ Automated timestamps
- ✅ Foreign key relationships
- ✅ Data validation constraints

## 🔐 Security Policies

### Public Access:
- Anyone can view professionals, categories, services, and reviews
- Authenticated users can add new professionals
- Users can only update their own professional profiles
- Authenticated users can add reviews

### Storage:
- Avatar images are publicly accessible
- Anyone can upload avatar images

## 🚀 Next Steps

### Update App Code:
1. Replace mock data with Supabase queries
2. Implement authentication
3. Add file upload for avatars
4. Set up real-time subscriptions

### Example Queries:
```sql
-- Get all professionals with categories
SELECT p.*, c.name as category_name, c.slug as category_slug
FROM professionals p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.verified = true
ORDER BY p.rating DESC;

-- Get professional with services
SELECT p.*, s.service_name
FROM professionals p
LEFT JOIN services s ON p.id = s.professional_id
WHERE p.id = 'professional-uuid';

-- Get professional reviews
SELECT r.*, p.name as professional_name
FROM reviews r
JOIN professionals p ON r.professional_id = p.id
WHERE p.id = 'professional-uuid'
ORDER BY r.created_at DESC;
```

## 📱 Testing the Connection

### Test in Browser:
1. Run your Next.js app: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Check browser console for any Supabase connection errors

### Test Database Connection:
```javascript
// In your browser console
import { supabase } from './src/lib/supabase';

const { data, error } = await supabase
  .from('professionals')
  .select('*, categories(name, slug)');

console.log('Professionals:', data);
console.log('Error:', error);
```

## 🔧 Troubleshooting

### Common Issues:
1. **CORS Errors**: Make sure your Supabase project URL is correct
2. **Permission Denied**: Check RLS policies in SQL Editor
3. **Connection Failed**: Verify environment variables are set correctly
4. **Data Not Loading**: Check table names and column names match schema

### Reset Database:
```sql
-- Drop all tables (WARNING: This deletes all data!)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS professionals CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Then re-run schema.sql
```

## 📞 Support

- Supabase Documentation: [docs.supabase.com](https://docs.supabase.com)
- Next.js Integration: [supabase.com/docs/guides/with-nextjs](https://supabase.com/docs/guides/with-nextjs)
- Issues: Check browser console and Supabase logs

---

**Your Siscora Connect app is now ready to connect with Supabase! 🎉**
