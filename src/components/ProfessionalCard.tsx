'use client'

import { Professional } from '@/types/directory'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Phone, Mail, Clock, CheckCircle, ArrowRight } from 'lucide-react'

interface ProfessionalCardProps {
  professional: Professional
  onViewProfile: (id: string) => void
}

export function ProfessionalCard({ professional, onViewProfile }: ProfessionalCardProps) {
  return (
    <Card className="modern-card group cursor-pointer overflow-hidden">
      {/* Card Header with Image/Avatar */}
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-2">
            {professional.verified && (
              <Badge className="text-xs bg-emerald-100 text-emerald-800 border-emerald-200 font-medium shadow-sm">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-bold text-gray-900">{professional.rating}</span>
            </div>
          </div>
        </div>
        
        {/* Professional Avatar/Image Area */}
        <div className="h-40 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl border-2 border-white relative z-10">
            <span className="text-2xl font-bold text-indigo-600">
              {professional.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Card Content */}
      <CardContent className="p-6 space-y-4">
        {/* Title and Category */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
              {professional.name}
            </CardTitle>
            <p className="text-sm font-medium text-gray-600 mt-1">{professional.profession}</p>
            <Badge variant="secondary" className="mt-2 text-xs bg-indigo-50 text-indigo-700 border-indigo-100 font-medium">
              {professional.category}
            </Badge>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
          {professional.description}
        </p>
        
        {/* Key Information Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-700 font-medium">{professional.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-700 font-medium">{professional.availability}</span>
          </div>
        </div>
        
        {/* Experience Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            <span className="font-bold text-gray-900 text-lg">{professional.experience}</span>
            <span className="text-gray-600"> years experience</span>
          </span>
        </div>

        {/* Services */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Services</h4>
          <div className="flex flex-wrap gap-1">
            {professional.services.slice(0, 3).map((service, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors">
                {service}
              </Badge>
            ))}
            {professional.services.length > 3 && (
              <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-700">
                +{professional.services.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Primary CTA */}
        <Button 
          onClick={() => onViewProfile(professional.id)}
          className="modern-button w-full group"
        >
          <span className="group-hover:translate-x-0.5 transition-transform duration-200">View Profile</span>
          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </Button>
      </CardContent>
    </Card>
  )
}
