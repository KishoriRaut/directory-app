# Professional Section Logic - How Professionals Appear in Different Sections

## Current System Overview

### 1. **Featured Professionals Section**
**Location**: Top of homepage (after Statistics)
**Logic**: 
- **NEW**: Now fetches from database (previously was hardcoded mock data)
- **Criteria**: 
  - Only verified professionals (`verified = true`)
  - Sorted by: Highest rating → Most experience
  - Limit: Top 3 professionals
- **Query**:
  ```sql
  SELECT * FROM professionals 
  WHERE verified = true 
  ORDER BY rating DESC, experience DESC 
  LIMIT 3
  ```
- **Display**: Shows 3 cards in a grid

### 2. **Browse All Professionals Section**
**Location**: Main content area with filters sidebar
**Logic**:
- Fetches from Supabase `professionals` table
- **Filters Applied**:
  - Category filter (if selected)
  - Location filter (if provided)
  - Search term (searches: name, profession, description, location)
  - Minimum rating filter
  - Verified only filter
- **Sorting Options**:
  - **Highest Rated** (default): Verified first → Rating → Newest
  - **Verified First**: Verified → Rating → Experience
  - **Newest First**: Created date (newest first)
  - **Most Experienced**: Experience → Rating
- **Pagination**: 12 professionals per page
- **Query Structure**:
  ```sql
  SELECT * FROM professionals 
  WHERE [filters applied]
  ORDER BY [sort option]
  LIMIT 12 OFFSET [page * 12]
  ```

### 3. **Popular Categories Section**
**Location**: Near top of homepage
**Logic**:
- **NOT a professional listing** - it's a navigation section
- Shows category links (Doctors, Plumbers, Electricians, etc.)
- Clicking a category applies a filter to "Browse All Professionals"
- Categories are hardcoded (not from database)
- **Purpose**: Quick navigation to filtered professional listings

## How Professionals Are Selected

### Featured Section Selection Criteria:
1. ✅ Must be verified (`verified = true`)
2. ✅ Highest rating (4.0+ typically)
3. ✅ Most experience (tie-breaker)
4. ✅ Limited to top 3

### Browse All Section Selection:
- **All professionals** from database (unless filtered)
- Filtered by user's search criteria
- Sorted by user's preference
- Paginated for performance

### Category Navigation:
- **Doesn't select professionals** - just provides navigation
- Clicking a category sets a filter in "Browse All Professionals"

## Database Schema

The `professionals` table has these relevant fields:
- `verified` (BOOLEAN) - Determines if professional can be featured
- `rating` (DECIMAL) - Used for sorting
- `experience` (INTEGER) - Used for sorting
- `category` (TEXT) - Used for filtering
- `created_at` (TIMESTAMP) - Used for "newest" sorting

## Current Implementation Status

✅ **Featured Professionals**: Now dynamically fetches from database
✅ **Browse All Professionals**: Fully functional with filters and sorting
✅ **Popular Categories**: Navigation links (working as intended)

## Future Enhancements (Optional)

1. **Featured Flag**: Add `is_featured` column to manually select featured professionals
2. **Admin Panel**: Allow admins to manually feature specific professionals
3. **Auto-Rotation**: Rotate featured professionals periodically
4. **Category-Specific Featured**: Show different featured professionals per category
