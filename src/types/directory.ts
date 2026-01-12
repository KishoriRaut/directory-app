export interface Professional {
  id: string
  name: string
  profession: string
  category: 'doctor' | 'engineer' | 'plumber' | 'electrician' | 'other'
  email: string
  phone: string
  location: string
  experience: number
  rating: number
  description: string
  services: string[]
  availability: string
  imageUrl?: string
  verified: boolean
  createdAt: string
}

export interface SearchFilters {
  search?: string
  category?: string
  profession?: string
  location?: string
  minRating?: number
  verified?: boolean
}
