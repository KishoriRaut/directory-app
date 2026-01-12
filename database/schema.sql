-- Siscora Connect Professional Directory Database Schema
-- Compatible with Supabase PostgreSQL

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table for professional categories
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professionals table for professional profiles
CREATE TABLE professionals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  profession VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  experience_years INTEGER NOT NULL CHECK (experience_years >= 0),
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  description TEXT,
  availability VARCHAR(255),
  verified BOOLEAN DEFAULT FALSE,
  avatar_url VARCHAR(500),
  website VARCHAR(500),
  linkedin VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table for professional services
CREATE TABLE services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  service_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table for professional reviews
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  reviewer_name VARCHAR(255) NOT NULL,
  reviewer_email VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
('Doctor', 'doctor', 'Medical professionals and healthcare providers'),
('Engineer', 'engineer', 'Engineering and technical professionals'),
('Plumber', 'plumber', 'Plumbing and home service professionals'),
('Electrician', 'electrician', 'Electrical and wiring professionals'),
('Other', 'other', 'Other professional services');

-- Create indexes for better performance
CREATE INDEX idx_professionals_category_id ON professionals(category_id);
CREATE INDEX idx_professionals_rating ON professionals(rating DESC);
CREATE INDEX idx_professionals_verified ON professionals(verified);
CREATE INDEX idx_professionals_location ON professionals(location);
CREATE INDEX idx_services_professional_id ON services(professional_id);
CREATE INDEX idx_reviews_professional_id ON reviews(professional_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access to professionals
CREATE POLICY "Professionals are viewable by everyone" ON professionals
    FOR SELECT USING (true);

-- Allow public read access to categories
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

-- Allow public read access to services
CREATE POLICY "Services are viewable by everyone" ON services
    FOR SELECT USING (true);

-- Allow public read access to reviews
CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT USING (true);

-- Allow authenticated users to insert professionals
CREATE POLICY "Authenticated users can insert professionals" ON professionals
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own professionals
CREATE POLICY "Users can update own professionals" ON professionals
    FOR UPDATE USING (auth.uid()::text = created_by::text);

-- Allow authenticated users to insert reviews
CREATE POLICY "Authenticated users can insert reviews" ON reviews
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload avatars" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- Add created_by column for ownership tracking
ALTER TABLE professionals ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE reviews ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update policies to use created_by
DROP POLICY IF EXISTS "Users can update own professionals" ON professionals;
CREATE POLICY "Users can update own professionals" ON professionals
    FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON reviews;
CREATE POLICY "Authenticated users can insert reviews" ON reviews
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);
