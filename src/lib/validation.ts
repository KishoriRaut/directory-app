import { VALIDATION_RULES } from './constants'

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export const validateField = (field: string, value: any): ValidationResult => {
  switch (field) {
    case 'name':
      if (!value || typeof value !== 'string') {
        return { isValid: false, error: 'Name is required' }
      }
      const name = value.trim()
      if (name.length < VALIDATION_RULES.name.minLength) {
        return { isValid: false, error: `Name must be at least ${VALIDATION_RULES.name.minLength} characters` }
      }
      if (name.length > VALIDATION_RULES.name.maxLength) {
        return { isValid: false, error: `Name must be less than ${VALIDATION_RULES.name.maxLength} characters` }
      }
      return { isValid: true }
    
    case 'profession':
      if (!value || typeof value !== 'string') {
        return { isValid: false, error: 'Profession is required' }
      }
      const profession = value.trim()
      if (profession.length < VALIDATION_RULES.profession.minLength) {
        return { isValid: false, error: `Profession must be at least ${VALIDATION_RULES.profession.minLength} characters` }
      }
      if (profession.length > VALIDATION_RULES.profession.maxLength) {
        return { isValid: false, error: `Profession must be less than ${VALIDATION_RULES.profession.maxLength} characters` }
      }
      return { isValid: true }
    
    case 'email':
      if (!value || typeof value !== 'string') {
        return { isValid: false, error: 'Email is required' }
      }
      const email = value.trim()
      if (!VALIDATION_RULES.email.pattern.test(email)) {
        return { isValid: false, error: 'Please enter a valid email address' }
      }
      return { isValid: true }
    
    case 'phone':
      if (value && typeof value === 'string') {
        if (!VALIDATION_RULES.phone.pattern.test(value)) {
          return { isValid: false, error: 'Please enter a valid phone number' }
        }
      }
      return { isValid: true }
    
    case 'experience':
      if (value !== undefined && typeof value === 'number') {
        if (value < VALIDATION_RULES.experience.min || value > VALIDATION_RULES.experience.max) {
          return { isValid: false, error: `Experience must be between ${VALIDATION_RULES.experience.min} and ${VALIDATION_RULES.experience.max} years` }
        }
      }
      return { isValid: true }
    
    case 'rating':
      if (value !== undefined && typeof value === 'number') {
        if (value < VALIDATION_RULES.rating.min || value > VALIDATION_RULES.rating.max) {
          return { isValid: false, error: `Rating must be between ${VALIDATION_RULES.rating.min} and ${VALIDATION_RULES.rating.max}` }
        }
      }
      return { isValid: true }
    
    case 'description':
      if (value && typeof value === 'string') {
        if (value.length > VALIDATION_RULES.description.maxLength) {
          return { isValid: false, error: `Description must be less than ${VALIDATION_RULES.description.maxLength} characters` }
        }
      }
      return { isValid: true }
    
    case 'website':
      if (value && typeof value === 'string') {
        if (!VALIDATION_RULES.website.pattern.test(value)) {
          return { isValid: false, error: 'Please enter a valid website URL (e.g., https://example.com)' }
        }
      }
      return { isValid: true }
    
    default:
      return { isValid: true }
  }
}

export const validateForm = (formData: Record<string, any>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  // Required fields
  const requiredFields = ['name', 'profession', 'email']
  requiredFields.forEach(field => {
    const result = validateField(field, formData[field])
    if (!result.isValid) {
      errors[field] = result.error || 'This field is required'
    }
  })

  // Optional fields
  const optionalFields = ['phone', 'experience', 'rating', 'description', 'website']
  optionalFields.forEach(field => {
    if (formData[field] !== undefined && formData[field] !== '') {
      const result = validateField(field, formData[field])
      if (!result.isValid) {
        errors[field] = result.error || 'Invalid input'
      }
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
