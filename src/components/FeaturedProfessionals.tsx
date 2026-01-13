'use client'

import { Star, MapPin, Briefcase, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const featuredProfessionals = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    title: 'Cardiologist',
    category: 'Doctor',
    location: 'San Francisco, CA',
    rating: 4.9,
    reviews: 127,
    image: '/api/placeholder/100/100',
    verified: true,
    responseTime: '1 hour',
    description: 'Board-certified cardiologist with 15+ years of experience'
  },
  {
    id: 2,
    name: 'Michael Chen',
    title: 'Master Plumber',
    category: 'Plumber',
    location: 'Los Angeles, CA',
    rating: 4.8,
    reviews: 89,
    image: '/api/placeholder/100/100',
    verified: true,
    responseTime: '30 minutes',
    description: 'Licensed plumber specializing in residential and commercial services'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    title: 'UX Designer',
    category: 'Designer',
    location: 'New York, NY',
    rating: 5.0,
    reviews: 203,
    image: '/api/placeholder/100/100',
    verified: true,
    responseTime: '2 hours',
    description: 'Award-winning designer with Fortune 500 experience'
  },
  {
    id: 4,
    name: 'James Wilson',
    title: 'Electrical Engineer',
    category: 'Engineer',
    location: 'Chicago, IL',
    rating: 4.7,
    reviews: 156,
    image: '/api/placeholder/100/100',
    verified: true,
    responseTime: '1 hour',
    description: 'Specialized in industrial automation and control systems'
  }
]

export function FeaturedProfessionals() {
  // Show top 3 for cleaner layout
  const topProfessionals = featuredProfessionals.slice(0, 3)
  
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Featured Professionals
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
            Top-rated professionals trusted by thousands
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {topProfessionals.map((professional) => (
            <div key={professional.id} className="bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
              <div className="p-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-indigo-600">
                      {professional.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{professional.name}</h3>
                      {professional.verified && (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{professional.title}</p>
                  </div>
                </div>

                {/* Rating & Location */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">{professional.rating}</span>
                    <span className="text-sm text-gray-500">({professional.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-[100px]">{professional.location}</span>
                  </div>
                </div>

                {/* Action Button */}
                <Link href={`/profile/${professional.id}`}>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
