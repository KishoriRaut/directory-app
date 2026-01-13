'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Professional } from '@/types/directory'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Star, MapPin, Phone, Mail, Clock, CheckCircle, User, Briefcase } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { StructuredData } from '@/components/StructuredData'

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [loading, setLoading] = useState(true)

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
          imageUrl: professionalData.image_url,
          verified: professionalData.verified,
          createdAt: professionalData.created_at
        }

        setProfessional(transformedProfessional)
      } catch (error) {
        console.error('Unexpected error fetching professional:', error)
        setProfessional(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProfessional()
  }, [params.id])

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Hero Image Section */}
            <div className="relative h-48 sm:h-56 md:h-64 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200">
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
                      sizes="(max-width: 768px) 100vw, 66vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          const fallback = parent.querySelector('.hero-avatar-fallback')
                          if (fallback) {
                            fallback.classList.remove('hidden')
                          }
                        }
                      }}
                    />
                    {/* Hero Fallback Avatar */}
                    <div className="hero-avatar-fallback hidden absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white mx-auto mb-4">
                          <span className="text-4xl font-bold text-indigo-600">
                            {getInitials(professional.name)}
                          </span>
                        </div>
                        <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-200 shadow-lg">
                          <span className="text-lg font-semibold text-gray-900">{professional.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white mx-auto mb-4">
                      <span className="text-4xl font-bold text-indigo-600">
                        {getInitials(professional.name)}
                      </span>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-200 shadow-lg">
                      <span className="text-lg font-semibold text-gray-900">{professional.name}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
            </div>

            <Card className="bg-white border border-gray-200 rounded-sm">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-start gap-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <div className="relative w-24 h-24">
                      {professional.imageUrl ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={professional.imageUrl}
                            alt={professional.name}
                            fill
                            className="object-cover rounded-full border-4 border-gray-100"
                            sizes="96px"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const parent = target.parentElement
                              if (parent) {
                                const fallback = parent.querySelector('.avatar-fallback')
                                if (fallback) {
                                  fallback.classList.remove('hidden')
                                }
                              }
                            }}
                          />
                          {/* Fallback Avatar */}
                          <div className="avatar-fallback hidden absolute inset-0 w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-gray-100">
                            <span className="text-2xl font-bold text-white">
                              {getInitials(professional.name)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-gray-100 relative">
                          <span className="text-2xl font-bold text-white">
                            {getInitials(professional.name)}
                          </span>
                          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-gray-200 shadow-sm">
                            <Briefcase className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-2xl mb-2 text-gray-900">{professional.name}</CardTitle>
                    <p className="text-lg text-gray-600 mb-3">{professional.profession}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">{professional.rating}</span>
                      </div>
                      {professional.verified && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900">About</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {professional.description}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-gray-900">Services Offered</h3>
                  <div className="flex flex-wrap gap-2">
                    {professional.services.map((service, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-50 border-gray-200 text-gray-700">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Location</p>
                        <p className="text-sm text-gray-600">{professional.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Availability</p>
                        <p className="text-sm text-gray-600">{professional.availability}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">Phone</p>
                          <p className="text-sm text-gray-600">{professional.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <p className="text-sm text-gray-600">{professional.email}</p>
                        </div>
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

                <div className="pt-4 space-y-2">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 rounded-sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                  <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 rounded-sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
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
