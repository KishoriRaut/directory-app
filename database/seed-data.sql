-- Sample data for Siscora Connect Professional Directory
-- Insert sample professionals with services and reviews

-- Insert sample professionals
INSERT INTO professionals (id, name, profession, category_id, email, phone, location, experience_years, rating, description, availability, verified, created_by) VALUES
(
  uuid_generate_v4(),
  'Dr. Sarah Johnson',
  'Cardiologist',
  (SELECT id FROM categories WHERE slug = 'doctor'),
  'sarah.johnson@email.com',
  '+1 (555) 123-4567',
  'New York, NY',
  12,
  4.8,
  'Experienced cardiologist specializing in heart disease prevention and treatment. Board-certified with over 12 years of clinical experience in cardiovascular medicine.',
  'Mon-Fri: 9AM-5PM',
  true,
  uuid_generate_v4()
),
(
  uuid_generate_v4(),
  'Michael Chen',
  'Software Engineer',
  (SELECT id FROM categories WHERE slug = 'engineer'),
  'michael.chen@email.com',
  '+1 (555) 234-5678',
  'San Francisco, CA',
  8,
  4.9,
  'Full-stack software engineer with expertise in React, Node.js, and cloud architecture. Specializing in scalable web applications and API development.',
  'Mon-Fri: 10AM-6PM',
  true,
  uuid_generate_v4()
),
(
  uuid_generate_v4(),
  'Robert Martinez',
  'Master Plumber',
  (SELECT id FROM categories WHERE slug = 'plumber'),
  'robert.martinez@email.com',
  '+1 (555) 345-6789',
  'Los Angeles, CA',
  15,
  4.7,
  'Licensed master plumber with 15+ years of experience in residential and commercial plumbing. Emergency services available 24/7.',
  '24/7 Emergency Service',
  true,
  uuid_generate_v4()
),
(
  uuid_generate_v4(),
  'Emily Thompson',
  'Electrical Engineer',
  (SELECT id FROM categories WHERE slug = 'electrician'),
  'emily.thompson@email.com',
  '+1 (555) 456-7890',
  'Chicago, IL',
  10,
  4.6,
  'Certified electrical engineer specializing in residential and commercial electrical systems. Expert in smart home automation and energy-efficient solutions.',
  'Mon-Sat: 8AM-6PM',
  true,
  uuid_generate_v4()
),
(
  uuid_generate_v4(),
  'Dr. James Wilson',
  'General Practitioner',
  (SELECT id FROM categories WHERE slug = 'doctor'),
  'james.wilson@email.com',
  '+1 (555) 567-8901',
  'Boston, MA',
  20,
  4.9,
  'Board-certified family physician providing comprehensive healthcare for all ages. Emphasis on preventive care and patient education.',
  'Mon-Fri: 8AM-7PM, Sat: 9AM-1PM',
  true,
  uuid_generate_v4()
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

-- Insert sample reviews
INSERT INTO reviews (professional_id, reviewer_name, reviewer_email, rating, comment, verified, created_by) VALUES
-- Reviews for Dr. Sarah Johnson
((SELECT id FROM professionals WHERE email = 'sarah.johnson@email.com'), 'John Doe', 'john.doe@email.com', 5, 'Excellent cardiologist! Very thorough and caring. Took time to explain everything clearly.', true, uuid_generate_v4()),
((SELECT id FROM professionals WHERE email = 'sarah.johnson@email.com'), 'Jane Smith', 'jane.smith@email.com', 4, 'Great experience overall. Wait time was a bit long but the care was excellent.', true, uuid_generate_v4()),

-- Reviews for Michael Chen
((SELECT id FROM professionals WHERE email = 'michael.chen@email.com'), 'Alex Johnson', 'alex.j@email.com', 5, 'Outstanding developer! Delivered our project on time and exceeded expectations.', true, uuid_generate_v4()),
((SELECT id FROM professionals WHERE email = 'michael.chen@email.com'), 'Sarah Lee', 'sarah.lee@email.com', 5, 'Michael is a genius! He solved our complex technical issues quickly.', true, uuid_generate_v4()),

-- Reviews for Robert Martinez
((SELECT id FROM professionals WHERE email = 'robert.martinez@email.com'), 'Tom Brown', 'tom.b@email.com', 4, 'Reliable and professional. Fixed our emergency plumbing issue quickly.', true, uuid_generate_v4()),
((SELECT id FROM professionals WHERE email = 'robert.martinez@email.com'), 'Lisa Davis', 'lisa.d@email.com', 5, 'Best plumber in LA! Fair prices and excellent work.', true, uuid_generate_v4()),

-- Reviews for Emily Thompson
((SELECT id FROM professionals WHERE email = 'emily.thompson@email.com'), 'Mark Wilson', 'mark.w@email.com', 5, 'Emily is amazing! She installed our smart home system perfectly.', true, uuid_generate_v4()),
((SELECT id FROM professionals WHERE email = 'emily.thompson@email.com'), 'Amy Chen', 'amy.chen@email.com', 4, 'Very knowledgeable and professional. Great electrical work.', true, uuid_generate_v4()),

-- Reviews for Dr. James Wilson
((SELECT id FROM professionals WHERE email = 'james.wilson@email.com'), 'Robert Taylor', 'robert.t@email.com', 5, 'Dr. Wilson is the best family doctor! Very thorough and caring.', true, uuid_generate_v4()),
((SELECT id FROM professionals WHERE email = 'james.wilson@email.com'), 'Maria Garcia', 'maria.g@email.com', 5, 'Excellent physician! Always takes time to listen and explain things.', true, uuid_generate_v4());
