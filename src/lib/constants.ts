// App constants
export const APP_NAME = 'Siscora Pro'
export const APP_DESCRIPTION = 'Professional Service Directory'
export const APP_CREATOR = 'by Siscora.com'

// Supabase constants
export const BUCKET_NAME = 'my-photo'
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Validation constants
export const VALIDATION_RULES = {
  name: { minLength: 2, maxLength: 50 },
  profession: { minLength: 2, maxLength: 100 },
  email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  phone: { pattern: /^\+?[\d\s\-\(\)\]]+$/ },
  experience: { min: 0, max: 50 },
  rating: { min: 0, max: 5 },
  description: { maxLength: 2000 },
  website: { pattern: /^https?:\/\/.+?\..+$/ }
}

// UI constants
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px'
}

// Animation constants
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500
}

// Category constants
export const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'doctor', label: 'Doctors' },
  { value: 'engineer', label: 'Engineers' },
  { value: 'plumber', label: 'Plumbers' },
  { value: 'electrician', label: 'Electricians' },
  { value: 'maid', label: 'Maids & Cleaners' },
  { value: 'designer', label: 'Designers' },
  { value: 'consultant', label: 'Consultants' },
  { value: 'therapist', label: 'Therapists' },
  { value: 'lawyer', label: 'Lawyers' },
  { value: 'accountant', label: 'Accountants' },
  { value: 'other', label: 'Other' }
]

// Profession constants
export const professions = [
  'All Professions',
  'Cardiologist',
  'General Practitioner',
  'Dentist',
  'Software Engineer',
  'Civil Engineer',
  'Mechanical Engineer',
  'Master Plumber',
  'Journeyman Plumber',
  'Master Electrician',
  'Residential Electrician',
  'Professional Maid',
  'House Cleaning Specialist',
  'Maid & Organizer'
]