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
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-2">
            {professional.verified && (
              <Badge className="text-xs bg-emerald-100 text-emerald-800 border-emerald-200 font-medium">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full border border-gray-200">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">{professional.rating}</span>
            </div>
          </div>
        </div>
        
        <div className="h-32 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-indigo-600">
              {professional.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
              {professional.name}
            </CardTitle>
            <p className="text-sm font-medium text-gray-600 mt-1">{professional.profession}</p>
            <Badge variant="secondary" className="mt-2 text-xs bg-indigo-50 text-indigo-700 border-indigo-100">
              {professional.category}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {professional.description}
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-gray-500">
                <MapPin className="h-4 w-4" />
                <span className="text-gray-700">{professional.location}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="h-4 w-4" />
                <span className="text-gray-700">{professional.availability}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{professional.experience}</span> years experience
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {professional.services.slice(0, 2).map((service, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-700">
                {service}
              </Badge>
            ))}
            {professional.services.length > 2 && (
              <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-700">
                +{professional.services.length - 2}
              </Badge>
            )}
          </div>

          <Button 
            onClick={() => onViewProfile(professional.id)}
            className="modern-button w-full"
          >
            View Profile
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
