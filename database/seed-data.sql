-- Sample data for Siscora Connect Professional Directory
-- Insert sample professionals with services

-- Insert sample professionals (matching the Professional interface from add-profile form)
INSERT INTO professionals (name, profession, category, email, phone, location, experience, rating, description, availability, verified) VALUES
(
  'Dr. Sarah Johnson',
  'Cardiologist',
  'doctor',
  'sarah.johnson@email.com',
  '+1 (555) 123-4567',
  'New York, NY',
  12,
  4.8,
  'Experienced cardiologist specializing in heart disease prevention and treatment. Board-certified with over 12 years of clinical experience in cardiovascular medicine.',
  'Mon-Fri: 9AM-5PM',
  true
),
(
  'Michael Chen',
  'Software Engineer',
  'engineer',
  'michael.chen@email.com',
  '+1 (555) 234-5678',
  'San Francisco, CA',
  8,
  4.9,
  'Full-stack software engineer with expertise in React, Node.js, and cloud architecture. Specializing in scalable web applications and API development.',
  'Mon-Fri: 10AM-6PM',
  true
),
(
  'Robert Martinez',
  'Master Plumber',
  'plumber',
  'robert.martinez@email.com',
  '+1 (555) 345-6789',
  'Los Angeles, CA',
  15,
  4.7,
  'Licensed master plumber with 15+ years of experience in residential and commercial plumbing. Emergency services available 24/7.',
  '24/7 Emergency Service',
  true
),
(
  'Emily Thompson',
  'Electrical Engineer',
  'electrician',
  'emily.thompson@email.com',
  '+1 (555) 456-7890',
  'Chicago, IL',
  10,
  4.6,
  'Certified electrical engineer specializing in residential and commercial electrical systems. Expert in smart home automation and energy-efficient solutions.',
  'Mon-Sat: 8AM-6PM',
  true
),
(
  'Dr. James Wilson',
  'General Practitioner',
  'doctor',
  'james.wilson@email.com',
  '+1 (555) 567-8901',
  'Boston, MA',
  20,
  4.9,
  'Board-certified family physician providing comprehensive healthcare for all ages. Emphasis on preventive care and patient education.',
  'Mon-Fri: 8AM-7PM, Sat: 9AM-1PM',
  true
),
(
  'John Smith',
  'Civil Engineer',
  'engineer',
  'john.smith@email.com',
  '+1 (555) 678-9012',
  'Seattle, WA',
  6,
  4.7,
  'Civil engineer with expertise in structural design and project management. Specializing in commercial building projects.',
  'Mon-Fri: 9AM-5PM',
  true
),
(
  'David Lee',
  'Journeyman Plumber',
  'plumber',
  'david.lee@email.com',
  '+1 (555) 789-0123',
  'Phoenix, AZ',
  7,
  4.4,
  'Reliable plumber specializing in residential plumbing repairs and installations. Licensed and insured.',
  'Mon-Sat: 7AM-6PM',
  false
),
(
  'James Anderson',
  'Residential Electrician',
  'electrician',
  'james.anderson@email.com',
  '+1 (555) 890-1234',
  'San Antonio, TX',
  5,
  4.3,
  'Electrician specializing in home electrical repairs and installations. Expert in residential wiring and panel upgrades.',
  'Mon-Sat: 8AM-6PM',
  false
),
(
  'Dr. Lisa Wang',
  'Dentist',
  'doctor',
  'lisa.wang@email.com',
  '+1 (555) 901-2345',
  'Portland, OR',
  9,
  4.7,
  'General dentist providing comprehensive dental care for the whole family. Specializing in cosmetic dentistry.',
  'Mon-Fri: 9AM-6PM, Sat: 9AM-2PM',
  true
),
(
  'Alex Turner',
  'Mechanical Engineer',
  'engineer',
  'alex.turner@email.com',
  '+1 (555) 012-3456',
  'Denver, CO',
  11,
  4.6,
  'Mechanical engineer specializing in HVAC systems and energy efficiency. Expert in sustainable building design.',
  'Mon-Fri: 9AM-5PM',
  true
);

-- Insert services for each professional
-- Dr. Sarah Johnson's services
INSERT INTO services (professional_id, service_name) VALUES
((SELECT id FROM professionals WHERE email = 'sarah.johnson@email.com'), 'Heart Check-ups'),
((SELECT id FROM professionals WHERE email = 'sarah.johnson@email.com'), 'Echocardiogram'),
((SELECT id FROM professionals WHERE email = 'sarah.johnson@email.com'), 'Stress Testing'),
((SELECT id FROM professionals WHERE email = 'sarah.johnson@email.com'), 'Cardiac Catheterization');

-- Michael Chen's services
INSERT INTO services (professional_id, service_name) VALUES
((SELECT id FROM professionals WHERE email = 'michael.chen@email.com'), 'Web Development'),
((SELECT id FROM professionals WHERE email = 'michael.chen@email.com'), 'Mobile App Development'),
((SELECT id FROM professionals WHERE email = 'michael.chen@email.com'), 'API Development'),
((SELECT id FROM professionals WHERE email = 'michael.chen@email.com'), 'Cloud Architecture');

-- Robert Martinez's services
INSERT INTO services (professional_id, service_name) VALUES
((SELECT id FROM professionals WHERE email = 'robert.martinez@email.com'), 'Emergency Plumbing'),
((SELECT id FROM professionals WHERE email = 'robert.martinez@email.com'), 'Pipe Installation'),
((SELECT id FROM professionals WHERE email = 'robert.martinez@email.com'), 'Drain Cleaning'),
((SELECT id FROM professionals WHERE email = 'robert.martinez@email.com'), 'Water Heater Installation');

-- Emily Thompson's services
INSERT INTO services (professional_id, service_name) VALUES
((SELECT id FROM professionals WHERE email = 'emily.thompson@email.com'), 'Electrical Installation'),
((SELECT id FROM professionals WHERE email = 'emily.thompson@email.com'), 'Smart Home Automation'),
((SELECT id FROM professionals WHERE email = 'emily.thompson@email.com'), 'Electrical Repairs'),
((SELECT id FROM professionals WHERE email = 'emily.thompson@email.com'), 'Energy Audits');

-- Dr. James Wilson's services
INSERT INTO services (professional_id, service_name) VALUES
((SELECT id FROM professionals WHERE email = 'james.wilson@email.com'), 'General Health Check-ups'),
((SELECT id FROM professionals WHERE email = 'james.wilson@email.com'), 'Vaccinations'),
((SELECT id FROM professionals WHERE email = 'james.wilson@email.com'), 'Health Screenings'),
((SELECT id FROM professionals WHERE email = 'james.wilson@email.com'), 'Chronic Disease Management');

-- John Smith's services
INSERT INTO services (professional_id, service_name) VALUES
((SELECT id FROM professionals WHERE email = 'john.smith@email.com'), 'Structural Analysis'),
((SELECT id FROM professionals WHERE email = 'john.smith@email.com'), 'Project Management'),
((SELECT id FROM professionals WHERE email = 'john.smith@email.com'), 'Site Planning'),
((SELECT id FROM professionals WHERE email = 'john.smith@email.com'), 'Construction Oversight');

-- David Lee's services
INSERT INTO services (professional_id, service_name) VALUES
((SELECT id FROM professionals WHERE email = 'david.lee@email.com'), 'Leak Detection'),
((SELECT id FROM professionals WHERE email = 'david.lee@email.com'), 'Fixture Installation'),
((SELECT id FROM professionals WHERE email = 'david.lee@email.com'), 'Pipe Repair'),
((SELECT id FROM professionals WHERE email = 'david.lee@email.com'), 'Bathroom Renovation');

-- James Anderson's services
INSERT INTO services (professional_id, service_name) VALUES
((SELECT id FROM professionals WHERE email = 'james.anderson@email.com'), 'Outlet Installation'),
((SELECT id FROM professionals WHERE email = 'james.anderson@email.com'), 'Lighting'),
((SELECT id FROM professionals WHERE email = 'james.anderson@email.com'), 'Circuit Repair'),
((SELECT id FROM professionals WHERE email = 'james.anderson@email.com'), 'Home Inspections');

-- Dr. Lisa Wang's services
INSERT INTO services (professional_id, service_name) VALUES
((SELECT id FROM professionals WHERE email = 'lisa.wang@email.com'), 'Dental Check-ups'),
((SELECT id FROM professionals WHERE email = 'lisa.wang@email.com'), 'Teeth Cleaning'),
((SELECT id FROM professionals WHERE email = 'lisa.wang@email.com'), 'Fillings'),
((SELECT id FROM professionals WHERE email = 'lisa.wang@email.com'), 'Cosmetic Dentistry');

-- Alex Turner's services
INSERT INTO services (professional_id, service_name) VALUES
((SELECT id FROM professionals WHERE email = 'alex.turner@email.com'), 'HVAC Design'),
((SELECT id FROM professionals WHERE email = 'alex.turner@email.com'), 'Energy Audits'),
((SELECT id FROM professionals WHERE email = 'alex.turner@email.com'), 'System Optimization'),
((SELECT id FROM professionals WHERE email = 'alex.turner@email.com'), 'Project Management');
