-- Update categories to match homepage and form
-- This script adds support for all categories shown on the homepage

-- First, update the CHECK constraint to allow all categories
ALTER TABLE professionals 
DROP CONSTRAINT IF EXISTS professionals_category_check;

ALTER TABLE professionals 
ADD CONSTRAINT professionals_category_check 
CHECK (category IN (
  'doctor', 
  'engineer', 
  'plumber', 
  'electrician', 
  'maid',
  'designer',
  'consultant',
  'therapist',
  'lawyer',
  'accountant',
  'other'
));

-- Update categories table to include all categories
INSERT INTO categories (slug, name, description, icon) VALUES
('maid', 'Maids & Cleaners', 'Cleaning and home services', 'sparkles'),
('designer', 'Designers', 'Creative professionals', 'palette'),
('consultant', 'Consultants', 'Business consulting', 'briefcase'),
('therapist', 'Therapists', 'Mental health experts', 'heart'),
('lawyer', 'Lawyers', 'Legal services', 'scale'),
('accountant', 'Accountants', 'Financial experts', 'calculator')
ON CONFLICT (slug) DO NOTHING;
