'use client'

import { memo } from 'react'
import { Professional } from '@/types/directory'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MapPin, CheckCircle, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { getDeterministicCount, getInitials } from '@/lib/utils'

interface ProfessionalCardProps {
  professional: Professional
  onViewProfile: (id: string) => void
}

export const ProfessionalCard = memo(function ProfessionalCard({ professional, onViewProfile }: ProfessionalCardProps) {

  const reviewCount = getDeterministicCount(professional.id)

  return (
    <Card className="group relative overflow-hidden border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 bg-white rounded-lg shadow-sm">
      {/* Verified Badge */}
      {professional.verified && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="text-xs bg-emerald-500 text-white border-0 font-medium">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        </div>
      )}

      {/* Image Section - Industry Standard: Square aspect ratio for profile photos */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
        {professional.imageUrl ? (
          <>
            <Image
              src={professional.imageUrl}
              alt={professional.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              decoding="async"
              onError={(e) => {
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
            <div className="avatar-fallback hidden absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl font-semibold text-white">
                  {getInitials(professional.name)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl font-semibold text-white">
                {getInitials(professional.name)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <CardContent className="p-5 space-y-3">
        {/* Header */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold sm:font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
            {professional.name}
          </h3>
          <p className="text-sm text-gray-600 truncate">{professional.profession}</p>
        </div>

        {/* Rating & Location */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-gray-900">{professional.rating}</span>
            <span className="text-sm text-gray-500">({reviewCount})</span>
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
        <Button 
          onClick={() => onViewProfile(professional.id)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
        >
          View Profile
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for memo - only re-render if professional data changes
  return prevProps.professional.id === nextProps.professional.id &&
         prevProps.professional.name === nextProps.professional.name &&
         prevProps.professional.imageUrl === nextProps.professional.imageUrl &&
         prevProps.professional.rating === nextProps.professional.rating &&
         prevProps.professional.verified === nextProps.professional.verified
})
