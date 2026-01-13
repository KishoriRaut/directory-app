'use client'

import { Star, MapPin, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  }
]

export function FeaturedProfessionals() {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }
  
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
          {featuredProfessionals.map((professional) => (
            <Card key={professional.id} className="group relative overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 bg-white rounded-lg">
              {/* Verified Badge */}
              {professional.verified && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="text-xs bg-emerald-500 text-white border-0 font-medium">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              )}

              {/* Image Section */}
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-semibold text-white">
                      {getInitials(professional.name)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <CardContent className="p-5 space-y-3">
                {/* Header */}
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                    {professional.name}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">{professional.title}</p>
                </div>

                {/* Rating & Location */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-900">{professional.rating}</span>
                    <span className="text-sm text-gray-500">({professional.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[120px]">{professional.location}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {professional.description}
                </p>

                {/* Action Button */}
                <Link href={`/profile/${professional.id}`}>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                    View Profile
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
