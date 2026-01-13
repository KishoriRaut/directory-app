# Category Consistency Fix

## Problem Identified
There was a **major inconsistency** between the form categories and homepage categories:

### Before:
- **Form**: Only 5 categories (doctor, engineer, plumber, electrician, other)
- **Homepage**: 10 categories (doctors, plumbers, electricians, engineers, maids, designers, consultants, therapists, lawyers, accountants)
- **Database**: Only allowed 5 categories in CHECK constraint

This meant users couldn't select categories that were shown on the homepage!

## Solution Implemented

### 1. Updated Form Categories (`src/app/add-profile/page.tsx`)
Now includes all 11 categories:
- Doctor
- Engineer
- Plumber
- Electrician
- Maid & Cleaner
- Designer
- Consultant
- Therapist
- Lawyer
- Accountant
- Other

### 2. Updated TypeScript Types (`src/types/directory.ts`)
Updated the `Professional` interface to include all category options.

### 3. Updated Database Schema (`database/schema.sql`)
- Updated CHECK constraint to allow all 11 categories
- Added all categories to the categories table

### 4. Updated Category Display Logic (`src/app/page.tsx`)
Updated the filter badge display to show proper names for all categories.

### 5. Created Migration Script (`database/update-categories.sql`)
For existing databases, run this script to update the schema without losing data.

## How to Apply to Existing Database

If you have an existing database, run the migration script:

```sql
-- Run database/update-categories.sql in Supabase SQL Editor
```

This will:
1. Update the CHECK constraint to allow all categories
2. Insert missing categories into the categories table

## Result

✅ **Form categories** now match **homepage categories**
✅ **Database** supports all categories
✅ **TypeScript types** are consistent
✅ Users can now select any category shown on the homepage
