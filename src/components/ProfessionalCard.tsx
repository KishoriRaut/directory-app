'use client'

import { Professional } from '@/types/directory'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Phone, Mail, Clock, CheckCircle, ArrowRight, Briefcase, Award } from 'lucide-react'
import Image from 'next/image'

interface ProfessionalCardProps {
  professional: Professional
  onViewProfile: (id: string) => void
}

export function ProfessionalCard({ professional, onViewProfile }: ProfessionalCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      doctor: 'bg-blue-100 text-blue-800 border-blue-200',
      engineer: 'bg-green-100 text-green-800 border-green-200',
      plumber: 'bg-orange-100 text-orange-800 border-orange-200',
      electrician: 'bg-purple-100 text-purple-800 border-purple-200',
      maid: 'bg-pink-100 text-pink-800 border-pink-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  return (
    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-2xl">
      {/* Status Badges */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 flex flex-col gap-2">
        {professional.verified && (
          <Badge className="text-xs bg-emerald-500 text-white border-emerald-600 font-medium shadow-lg">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )}
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-200 shadow-lg">
          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-xs sm:text-sm font-bold text-gray-900">{professional.rating}</span>
        </div>
      </div>

      {/* Image Section */}
      <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        {/* Professional Image or Avatar */}
        <div className="absolute inset-0 flex items-center justify-center">
          {professional.imageUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={professional.imageUrl}
                alt={professional.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={(e) => {
                  // Fallback to avatar if image fails to load
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent) {
                    const avatar = parent.querySelector('.avatar-fallback')
                    if (avatar) {
                      avatar.classList.remove('hidden')
                    }
                  }
                }}
              />
              {/* Avatar Fallback */}
              <div className="avatar-fallback hidden absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                  <span className="text-3xl font-bold text-indigo-600">
                    {getInitials(professional.name)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Avatar Circle */}
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white relative">
                <span className="text-3xl font-bold text-indigo-600">
                  {getInitials(professional.name)}
                </span>
              </div>
              {/* Category Icon */}
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center border-3 border-white shadow-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content Section */}
      <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 truncate">
                {professional.name}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{professional.profession}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`text-xs font-medium border ${getCategoryColor(professional.category)}`}>
              {professional.category.charAt(0).toUpperCase() + professional.category.slice(1)}
            </Badge>
            {professional.experience > 10 && (
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                <Award className="h-3 w-3 mr-1" />
                Expert
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {professional.description}
        </p>

        {/* Key Info Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm p-2 bg-gray-50 rounded-lg">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-700 font-medium truncate">{professional.location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm p-2 bg-gray-50 rounded-lg">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-700 font-medium truncate">{professional.availability}</span>
          </div>
        </div>

        {/* Experience Highlight */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Experience</p>
              <p className="text-lg font-bold text-gray-900">{professional.experience} years</p>
            </div>
          </div>
        </div>

        {/* Services Preview */}
        {professional.services.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">Services</h4>
            <div className="flex flex-wrap gap-1">
              {professional.services.slice(0, 2).map((service, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-white border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  {service}
                </Badge>
              ))}
              {professional.services.length > 2 && (
                <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-600">
                  +{professional.services.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onViewProfile(professional.id)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 hover:border-indigo-700 rounded-xl group"
          >
            <span className="group-hover:translate-x-0.5 transition-transform duration-200">View Profile</span>
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </Button>
          
          {/* Quick Contact Buttons */}
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="outline" 
              className="w-10 h-10 rounded-lg border-gray-200 hover:bg-gray-50 p-0"
              onClick={() => window.open(`tel:${professional.phone}`, '_blank')}
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-10 h-10 rounded-lg border-gray-200 hover:bg-gray-50 p-0"
              onClick={() => window.open(`mailto:${professional.email}`, '_blank')}
            >
              <Mail className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
