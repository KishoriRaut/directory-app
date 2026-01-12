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
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Professionals
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Top-rated professionals trusted by thousands of customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProfessionals.map((professional) => (
            <div key={professional.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Profile Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-600">
                      {professional.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{professional.name}</h3>
                      {professional.verified && (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{professional.title}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{professional.location}</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 font-semibold text-gray-900">{professional.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">({professional.reviews} reviews)</span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {professional.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    <span>{professional.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{professional.responseTime}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link href={`/profile/${professional.id}`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Profile
                    </Button>
                  </Link>
                  <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    Contact
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="#professionals">
            <Button variant="outline" className="px-8 py-3">
              View All Professionals
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
