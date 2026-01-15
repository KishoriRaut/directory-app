'use client'

import { useState, useEffect } from 'react'
import { Star, MapPin, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import { isSupabaseConfigured, buildProfessionalsQuery, checkIsVisibleColumnExists, setIsVisibleColumnExists, isMissingColumnError } from '@/lib/supabase'
import { Professional } from '@/types/directory'
import { getInitials } from '@/lib/utils'

export function FeaturedProfessionals() {
  const [featuredProfessionals, setFeaturedProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false)
        return
      }

      try {
        // Fetch top 3 professionals based on:
        // 1. Verified status (priority - verified first)
        // 2. Newest first (latest professionals)
        // 3. Highest rating (tie-breaker)
        // CRITICAL: Only show visible profiles (industry best practice)
        let query = buildProfessionalsQuery()
        
        if (checkIsVisibleColumnExists()) {
          query = query.eq('is_visible', true) // Only show visible profiles
        }
        
        query = query
          .order('verified', { ascending: false }) // Verified professionals first
          .order('created_at', { ascending: false }) // Then newest first
          .order('rating', { ascending: false }) // Then by rating
          .limit(3)
        
        let { data, error } = await query

        // If error is due to missing is_visible column, retry without the filter
        if (error && isMissingColumnError(error)) {
          setIsVisibleColumnExists(false)
          // Retry query without is_visible filter
          query = buildProfessionalsQuery()
            .order('verified', { ascending: false })
            .order('created_at', { ascending: false })
            .order('rating', { ascending: false })
            .limit(3)
          
          const retryResult = await query
          data = retryResult.data
          error = retryResult.error
          
          // If still error after retry, check if it's missing column error
          if (error && isMissingColumnError(error)) {
          // Mark that the column doesn't exist so we don't try again
          if (typeof window !== 'undefined') {
            (window as any).__isVisibleColumnExists = false
          }
          
          // Only log once per session to avoid console spam
          if (!(window as any).__isVisibleColumnWarningShown) {
            console.warn('ℹ️ is_visible column not found. Fetching all profiles. Run database/add-is-visible-field.sql migration to enable visibility filtering.')
            ;(window as any).__isVisibleColumnWarningShown = true
          }
          
            // Mark that the column doesn't exist so we don't try again
            if (typeof window !== 'undefined') {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (window as any).__isVisibleColumnExists = false
            }
            
            // Only log once per session to avoid console spam
            if (!(window as any).__isVisibleColumnWarningShown) {
              console.warn('ℹ️ is_visible column not found. Fetching all profiles. Run database/add-is-visible-field.sql migration to enable visibility filtering.')
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ;(window as any).__isVisibleColumnWarningShown = true
            }
          }
        }

        if (error) {
          console.error('Error fetching featured professionals:', error)
          setLoading(false)
          return
        }

        // Transform data to match Professional interface
        const transformedData: Professional[] = (data || []).map((prof: any) => ({
          id: prof.id,
          name: prof.name,
          profession: prof.profession,
          category: prof.category,
          email: prof.email,
          phone: prof.phone,
          location: prof.location,
          experience: prof.experience,
          rating: prof.rating,
          description: prof.description,
          services: prof.services?.map((s: any) => s.service_name) || [],
          availability: prof.availability,
          imageUrl: prof.image_url,
          verified: prof.verified,
          createdAt: prof.created_at
        }))

        setFeaturedProfessionals(transformedData)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeatured()
  }, [])

  // Show loading state or empty state
  if (loading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Featured Professionals
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
              Top-rated professionals trusted by thousands
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (featuredProfessionals.length === 0) {
    return null // Don't show section if no featured professionals
  }
  
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Featured
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-5xl mx-auto">
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

              {/* Image Section - Industry Standard: Square aspect ratio for profile photos */}
              <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                {professional.imageUrl ? (
                  <>
                    <Image
                      src={professional.imageUrl}
                      alt={professional.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
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
                    <div className="avatar-fallback hidden absolute inset-0 items-center justify-center bg-gray-100">
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
              <CardContent className="p-4 sm:p-5 space-y-3">
                {/* Header */}
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold sm:font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                    {professional.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{professional.profession}</p>
                </div>

                {/* Rating & Location */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-gray-900">{professional.rating}</span>
                    <span className="text-sm text-gray-500">({Math.floor(Math.random() * 100 + 10)})</span>
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
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg touch-target h-11 sm:h-12 text-sm sm:text-base">
                    View Profile
                    <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
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
