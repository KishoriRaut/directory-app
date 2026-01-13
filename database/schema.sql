-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS professionals CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create professionals table (matches the Professional interface from add-profile form)
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  profession TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('doctor', 'engineer', 'plumber', 'electrician', 'maid', 'designer', 'consultant', 'therapist', 'lawyer', 'accountant', 'other')),
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  experience INTEGER NOT NULL CHECK (experience >= 0),
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  description TEXT NOT NULL,
  availability TEXT NOT NULL,
  image_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create services table for the services array
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (slug, name, description, icon) VALUES
('doctor', 'Doctors', 'Medical professionals and healthcare providers', 'stethoscope'),
('engineer', 'Engineers', 'Engineering and technical professionals', 'wrench'),
('plumber', 'Plumbers', 'Plumbing and drainage specialists', 'pipe'),
('electrician', 'Electricians', 'Electrical and wiring professionals', 'bolt'),
('maid', 'Maids & Cleaners', 'Cleaning and home services', 'sparkles'),
('designer', 'Designers', 'Creative professionals', 'palette'),
('consultant', 'Consultants', 'Business consulting', 'briefcase'),
('therapist', 'Therapists', 'Mental health experts', 'heart'),
('lawyer', 'Lawyers', 'Legal services', 'scale'),
('accountant', 'Accountants', 'Financial experts', 'calculator'),
('other', 'Other', 'Other professional services', 'briefcase');

-- Create indexes for performance
CREATE INDEX idx_professionals_category ON professionals(category);
CREATE INDEX idx_professionals_location ON professionals(location);
CREATE INDEX idx_professionals_rating ON professionals(rating DESC);
CREATE INDEX idx_professionals_verified ON professionals(verified);
CREATE INDEX idx_professionals_created_at ON professionals(created_at DESC);
CREATE INDEX idx_services_professional_id ON services(professional_id);

-- Enable Row Level Security
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can read professionals data
CREATE POLICY "Professionals are viewable by everyone" ON professionals
  FOR SELECT USING (true);

-- Anyone can insert professionals (for profile submissions)
CREATE POLICY "Anyone can create professionals" ON professionals
  FOR INSERT WITH CHECK (true);

-- Profile owners can update their own data
CREATE POLICY "Users can update own professionals" ON professionals
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Anyone can read services
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (true);

-- Anyone can insert services (when creating professional profile)
CREATE POLICY "Anyone can create services" ON services
  FOR INSERT WITH CHECK (true);

-- Service owners can update their own services
CREATE POLICY "Users can update own services" ON services
  FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM professionals 
    WHERE professionals.id = services.professional_id 
    AND auth.uid()::text = professionals.id::text
  )
);

-- Anyone can read categories
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
