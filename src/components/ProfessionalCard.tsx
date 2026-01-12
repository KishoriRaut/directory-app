'use client'

import { Professional } from '@/types/directory'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Phone, Mail, Clock } from 'lucide-react'

interface ProfessionalCardProps {
  professional: Professional
  onViewProfile: (id: string) => void
}

export function ProfessionalCard({ professional, onViewProfile }: ProfessionalCardProps) {
  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{professional.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{professional.profession}</p>
          </div>
          <div className="flex items-center gap-2">
            {professional.verified && (
              <Badge variant="secondary" className="text-xs">Verified</Badge>
            )}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{professional.rating}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {professional.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{professional.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{professional.availability}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Experience:</span>
            <span>{professional.experience} years</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {professional.services.slice(0, 3).map((service, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {service}
            </Badge>
          ))}
          {professional.services.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{professional.services.length - 3} more
            </Badge>
          )}
        </div>

        <Button 
          onClick={() => onViewProfile(professional.id)}
          className="w-full"
        >
          View Profile
        </Button>
      </CardContent>
    </Card>
  )
}
