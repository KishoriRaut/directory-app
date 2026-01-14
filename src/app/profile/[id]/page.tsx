'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Professional } from '@/types/directory'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Star, MapPin, Phone, Mail, Clock, CheckCircle, User, Briefcase } from 'lucide-react'
import Link from 'next/link'
// Using regular img tag for external Supabase URLs (more reliable than Next.js Image)
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { StructuredData } from '@/components/StructuredData'

export default function ProfilePage() {
  const params = useParams()
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [loading, setLoading] = useState(true)
  const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  useEffect(() => {
    const fetchProfessional = async () => {
      if (!params.id) {
        console.error('No ID parameter provided')
        setProfessional(null)
        setLoading(false)
        return
      }

      // Extract and validate ID
      const idString = Array.isArray(params.id) ? params.id[0] : params.id
      if (!idString || idString.trim().length === 0) {
        console.error('Invalid ID: ID is empty or undefined')
        setProfessional(null)
        setLoading(false)
        return
      }

      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        console.error('Supabase is not configured. Please set up environment variables.')
        setProfessional(null)
        setLoading(false)
        return
      }

      try {
        // Helper function to check if error is meaningful
        // Only return true if error has actual error properties (message, code, etc.)
        // Empty objects {} or objects without error properties should be treated as no error
        const hasError = (err: any): boolean => {
          if (!err) return false
          // Check if it has any meaningful error properties
          // If none exist, it's not a real error (even if it's an object)
          const hasErrorProperty = !!(err.message || err.code || err.details || err.hint || err.statusCode || err.status)
          return hasErrorProperty
        }

        // First try with services join
        let { data, error } = await supabase
          .from('professionals')
          .select(`
            *,
            services (
              service_name
            )
          `)
          .eq('id', idString)
          .maybeSingle()

        // If error with services join, try without it
        if (hasError(error)) {
          console.warn('Error with services join, trying without:', error)
          
          // Fallback: fetch professional without services
          const { data: professionalData, error: professionalError } = await supabase
            .from('professionals')
            .select('*')
            .eq('id', idString)
            .maybeSingle()

          // If we have data, use it (ignore any error objects)
          if (professionalData) {
            data = professionalData
            // Fetch services separately
            const { data: servicesData } = await supabase
              .from('services')
              .select('service_name')
              .eq('professional_id', idString)
            
            if (data) {
              (data as any).services = servicesData?.map((s: any) => s.service_name) || []
            }
            error = null // Clear error since we successfully fetched
          } else if (professionalError) {
            // CRITICAL: First check if error object is empty using multiple methods
            const errorKeys = Object.keys(professionalError)
            const errorStringified = JSON.stringify(professionalError)
            const isEmptyByKeys = errorKeys.length === 0
            const isEmptyByString = errorStringified === '{}'
            
            // If it's empty by any measure, skip ALL error handling
            if (isEmptyByKeys && isEmptyByString) {
              // Definitely empty object {} - treat as "not found", don't log anything
              // Continue to "not found" handling below
            } else {
              // Only check for error properties if it's NOT empty
              // Use 'in' operator to check for property existence
              const hasMessage = 'message' in professionalError && professionalError.message != null
              const hasCode = 'code' in professionalError && professionalError.code != null
              const hasDetails = 'details' in professionalError && professionalError.details != null
              const hasHint = 'hint' in professionalError && professionalError.hint != null
              const hasStatusCode = 'statusCode' in professionalError && professionalError.statusCode != null
              const hasStatus = 'status' in professionalError && professionalError.status != null
              
              // Only log if it has at least one error property AND is not empty
              // Final safety check: verify it's not empty right before logging
              const finalCheck = (hasMessage || hasCode || hasDetails || hasHint || hasStatusCode || hasStatus) && 
                                !isEmptyByKeys && 
                                errorKeys.length > 0 &&
                                errorStringified !== '{}'
              
              if (finalCheck) {
                // One more check: verify at least one property actually has a value
                const hasActualValue = (
                  (hasMessage && professionalError.message) ||
                  (hasCode && professionalError.code) ||
                  (hasDetails && professionalError.details) ||
                  (hasHint && professionalError.hint) ||
                  (hasStatusCode && professionalError.statusCode) ||
                  (hasStatus && professionalError.status)
                )
                
                if (hasActualValue) {
                  console.error('Error fetching professional:', {
                    message: professionalError.message,
                    code: professionalError.code,
                    details: professionalError.details,
                    hint: professionalError.hint,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    statusCode: (professionalError as any).statusCode,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    status: (professionalError as any).status,
                    fullError: professionalError
                  })
                  setProfessional(null)
                  setLoading(false)
                  return
                }
              }
              // If no error properties exist, treat as "not found" and continue
            }
          }
          // If no data and no error, continue to "not found" handling below
        } else if (error && !data) {
          // Handle error from initial query - only if we have an error AND no data
          // Check directly for error properties (same logic as fallback)
          const hasMessage = !!error.message
          const hasCode = !!error.code
          const hasDetails = !!error.details
          const hasHint = !!error.hint
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const hasStatusCode = !!(error as any).statusCode
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const hasStatus = !!(error as any).status
          
          // Only log if at least one error property exists
          if (hasMessage || hasCode || hasDetails || hasHint || hasStatusCode || hasStatus) {
            console.error('Error fetching professional:', {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              statusCode: (error as any).statusCode,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              status: (error as any).status,
              fullError: error
            })
            setProfessional(null)
            setLoading(false)
            return
          }
          // If no error properties exist (empty object {}), treat as "not found" and continue
        }

        if (!data) {
          console.log('No professional found with ID:', idString)
          setProfessional(null)
          setLoading(false)
          return
        }

        // Type assertion for the data
        const professionalData = data as any

        // Transform data to match Professional interface
        const imageUrl = professionalData.image_url || undefined
        
        const transformedProfessional: Professional = {
          id: professionalData.id,
          name: professionalData.name,
          profession: professionalData.profession,
          category: professionalData.category,
          email: professionalData.email,
          phone: professionalData.phone,
          location: professionalData.location,
          experience: professionalData.experience,
          rating: professionalData.rating,
          description: professionalData.description,
          services: professionalData.services?.map((s: any) => s.service_name) || [],
          availability: professionalData.availability,
          imageUrl: imageUrl,
          verified: professionalData.verified,
          createdAt: professionalData.created_at
        }

        console.log('Profile data transformed:', {
          hasImageUrl: !!transformedProfessional.imageUrl,
          imageUrl: transformedProfessional.imageUrl,
          imageUrlType: typeof transformedProfessional.imageUrl
        })

        setProfessional(transformedProfessional)
        
        // If image URL exists, try to create blob URL for better CORS handling
        if (imageUrl && imageUrl.includes('supabase.co')) {
          fetch(imageUrl, { mode: 'cors', credentials: 'omit' })
            .then(async (response) => {
              if (response.ok) {
                const contentType = response.headers.get('content-type')
                if (contentType && contentType.startsWith('image/')) {
                  const blob = await response.blob()
                  if (blob.type.startsWith('image/')) {
                    const url = URL.createObjectURL(blob)
                    setImageBlobUrl(url)
                    console.log('Created blob URL for profile image')
                  }
                }
              }
            })
            .catch((error) => {
              console.warn('Could not create blob URL for image:', error)
            })
        }
      } catch (error) {
        console.error('Unexpected error fetching professional:', error)
        setProfessional(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProfessional()
    
    // Cleanup blob URL on unmount
    return () => {
      if (imageBlobUrl) {
        URL.revokeObjectURL(imageBlobUrl)
      }
    }
  }, [params.id, imageBlobUrl])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-6">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Directory
              </Button>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
            <p className="text-muted-foreground mb-4">The professional profile you're looking for doesn't exist.</p>
            <Link href="/">
              <Button>Browse Directory</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Structured Data for SEO */}
      {professional && (
        <StructuredData 
          type="LocalBusiness" 
          data={{
            name: professional.name,
            description: professional.description,
            location: professional.location,
            phone: professional.phone,
            email: professional.email,
            rating: professional.rating
          }}
        />
      )}
      
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Directory
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header Card - Industry Standard Layout */}
            <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
              {/* Hero Banner Section - Industry Standard: Compact banner with subtle content */}
              <div className="relative h-32 sm:h-40 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50">
                {/* Subtle Pattern Overlay */}
                <div 
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20.5H0v2h22V24H0v2h22V28H0v2h22V32H0v2h22V36H0v2h22v2H0v-2h22v-2H0v-2h22v-2H0v-2h22v-2H0v-2h22v-2H0v-2h22V20.5z'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '40px 40px'
                  }}
                />
                {/* Subtle content in banner - Industry Standard: Category/Profession badge */}
                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
                  <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 shadow-sm px-3 py-1.5 text-sm font-medium">
                    <Briefcase className="h-3.5 w-3.5 mr-1.5 inline" />
                    {professional.category}
                  </Badge>
                </div>
              </div>

              {/* Profile Content Section */}
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row items-start gap-6 -mt-12 sm:-mt-16">
                  {/* Large Profile Image - Industry Standard: 160-200px */}
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                      {(() => {
                        // Determine which image URL to use (blob URL preferred for CORS)
                        const imageUrlToUse = imageBlobUrl || professional.imageUrl
                        const hasImage = imageUrlToUse && typeof imageUrlToUse === 'string' && imageUrlToUse.trim() !== ''
                        
                        console.log('Profile image render:', {
                          hasImageUrl: !!professional.imageUrl,
                          imageUrl: professional.imageUrl,
                          hasBlobUrl: !!imageBlobUrl,
                          imageUrlToUse: imageUrlToUse,
                          hasImage: hasImage
                        })
                        
                        if (hasImage) {
                          return (
                            <div className="relative w-full h-full">
                              {/* Profile Image - Use blob URL if available, otherwise direct URL */}
                              <img
                                src={imageUrlToUse}
                                alt={`${professional.name} - ${professional.profession}`}
                                className="w-full h-full object-cover rounded-full border-4 border-white shadow-xl bg-white relative z-0"
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                                loading="eager"
                                onError={(e) => {
                                  console.error('Profile image failed to load:', imageUrlToUse)
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  const parent = target.parentElement
                                  if (parent) {
                                    const fallback = parent.querySelector('.profile-avatar-fallback')
                                    if (fallback) {
                                      fallback.classList.remove('hidden')
                                    }
                                  }
                                }}
                                onLoad={() => {
                                  console.log('Profile image loaded successfully')
                                }}
                              />
                              {/* Fallback Avatar - Shows if image fails to load */}
                              <div className="profile-avatar-fallback hidden absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl z-10">
                                <span className="text-3xl sm:text-4xl font-bold text-white">
                                  {getInitials(professional.name)}
                                </span>
                              </div>
                            </div>
                          )
                        } else {
                          return (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl relative">
                              <span className="text-3xl sm:text-4xl font-bold text-white">
                                {getInitials(professional.name)}
                              </span>
                              {/* Verified Badge on Avatar - Industry Standard: Bottom right corner */}
                              {professional.verified && (
                                <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg z-20">
                                  <CheckCircle className="h-5 w-5 text-white" />
                                </div>
                              )}
                            </div>
                          )
                        }
                      })()}
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 min-w-0 text-center sm:text-left mt-4 sm:mt-0">
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      {professional.name}
                    </CardTitle>
                    <p className="text-lg sm:text-xl text-gray-600 mb-4 font-medium">
                      {professional.profession}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">{professional.rating}</span>
                        <span className="text-sm text-gray-500">({professional.experience} years)</span>
                      </div>
                      {professional.verified && (
                        <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-700">Verified</span>
                        </div>
                      )}
                      <Badge variant="outline" className="capitalize bg-gray-50 border-gray-200 text-gray-700 px-3 py-1.5">
                        {professional.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6 pt-4">
                {/* About Section */}
                <div className="border-b border-gray-100 pb-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-600" />
                    About
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {professional.description}
                  </p>
                </div>

                {/* Services Section */}
                <div className="border-b border-gray-100 pb-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-indigo-600" />
                    Services Offered
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {professional.services && professional.services.length > 0 ? (
                      professional.services.map((service, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 text-sm font-medium"
                        >
                          {service}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No services listed yet.</p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Location</p>
                        <p className="text-sm font-semibold text-gray-900">{professional.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Availability</p>
                        <p className="text-sm font-semibold text-gray-900">{professional.availability}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Phone className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                        <a href={`tel:${professional.phone}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                          {professional.phone}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</p>
                        <a href={`mailto:${professional.email}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline break-all">
                          {professional.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-white border border-gray-200 rounded-sm sticky top-6">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-900">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-medium text-gray-900">{professional.experience} years</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Category</span>
                  <Badge variant="outline" className="capitalize bg-gray-50 border-gray-200 text-gray-700">
                    {professional.category}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-gray-900">{professional.rating}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Status</span>
                  <div className="flex items-center gap-1">
                    {professional.verified ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Verified</span>
                      </>
                    ) : (
                      <span className="text-gray-600">Not Verified</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 space-y-3 border-t border-gray-100">
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    onClick={() => window.location.href = `tel:${professional.phone}`}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    onClick={() => window.location.href = `mailto:${professional.email}`}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
