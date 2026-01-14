'use client'

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Professional } from '@/types/directory'
import { ProfessionalCard } from '@/components/ProfessionalCard'
import { SearchFilters } from '@/components/SearchFilters'
import { SearchFilters as SearchFiltersType } from '@/types/directory'
import { Pagination } from '@/components/Pagination'
import { debounce } from '@/lib/performance'
import { Header } from '@/components/Header'
import { HeroSearch } from '@/components/HeroSearch'
import dynamic from 'next/dynamic'

// Lazy load below-the-fold components for better initial load performance
const PopularCategories = dynamic(() => import('@/components/PopularCategories').then(mod => ({ default: mod.PopularCategories })), {
  loading: () => <div className="py-12 sm:py-16 bg-white"><div className="container mx-auto px-6"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div><div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"><div className="h-24 bg-gray-200 rounded"></div><div className="h-24 bg-gray-200 rounded"></div><div className="h-24 bg-gray-200 rounded"></div><div className="h-24 bg-gray-200 rounded"></div><div className="h-24 bg-gray-200 rounded"></div><div className="h-24 bg-gray-200 rounded"></div></div></div></div></div>,
  ssr: true
})

const HowItWorks = dynamic(() => import('@/components/HowItWorks').then(mod => ({ default: mod.HowItWorks })), {
  loading: () => <div className="py-12 sm:py-16 bg-gray-50"><div className="container mx-auto px-6"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48 mx-auto"></div><div className="h-4 bg-gray-200 rounded w-80 mx-auto"></div><div className="grid grid-cols-1 md:grid-cols-4 gap-6"><div className="h-32 bg-gray-200 rounded"></div><div className="h-32 bg-gray-200 rounded"></div><div className="h-32 bg-gray-200 rounded"></div><div className="h-32 bg-gray-200 rounded"></div></div></div></div></div>,
  ssr: true
})

const FeaturedProfessionals = dynamic(() => import('@/components/FeaturedProfessionals').then(mod => ({ default: mod.FeaturedProfessionals })), {
  loading: () => <div className="py-12 sm:py-16 bg-white"><div className="container mx-auto px-6"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div><div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="h-64 bg-gray-200 rounded"></div><div className="h-64 bg-gray-200 rounded"></div><div className="h-64 bg-gray-200 rounded"></div></div></div></div></div>,
  ssr: true
})

const Testimonials = dynamic(() => import('@/components/Testimonials').then(mod => ({ default: mod.Testimonials })), {
  loading: () => <div className="py-12 sm:py-16 bg-white"><div className="container mx-auto px-6"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div><div className="h-4 bg-gray-200 rounded w-80 mx-auto"></div><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="h-48 bg-gray-200 rounded"></div><div className="h-48 bg-gray-200 rounded"></div><div className="h-48 bg-gray-200 rounded"></div></div></div></div></div>,
  ssr: true
})

const Statistics = dynamic(() => import('@/components/Statistics').then(mod => ({ default: mod.Statistics })), {
  loading: () => <div className="py-12 sm:py-16 bg-indigo-600"><div className="container mx-auto px-6"><div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-6"><div className="h-24 bg-indigo-500 rounded"></div><div className="h-24 bg-indigo-500 rounded"></div><div className="h-24 bg-indigo-500 rounded"></div><div className="h-24 bg-indigo-500 rounded"></div></div></div></div>,
  ssr: true
})
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Search, CheckCircle, Star, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'
import { supabase, isSupabaseConfigured, buildProfessionalsQuery, checkIsVisibleColumnExists, setIsVisibleColumnExists, isMissingColumnError } from '@/lib/supabase'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StructuredData } from '@/components/StructuredData'
import type { User } from '@supabase/supabase-js'

type SortOption = 'rating-desc' | 'verified-first' | 'newest' | 'experience-desc'

interface SupabaseProfessional {
  id: string
  name: string
  profession: string
  category: string
  email: string
  phone: string
  location: string
  experience: number
  rating: number
  description: string
  availability: string
  image_url?: string | null
  verified: boolean
  created_at: string
  services?: Array<{ service_name: string }>
}

export default function Home() {
  const [filters, setFilters] = useState<SearchFiltersType>({})
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [sortBy, setSortBy] = useState<SortOption>('newest') // Default: Newest First

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          // Handle refresh token errors
          if (error.message?.includes('Refresh Token') || error.message?.includes('refresh_token')) {
            // Clear invalid session
            await supabase.auth.signOut()
            setUser(null)
            return
          }
          console.error('Auth error:', error)
        }
        setUser(session?.user || null)
      } catch (error: unknown) {
        // Handle any unexpected errors
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('Refresh Token') || errorMessage.includes('refresh_token')) {
          await supabase.auth.signOut()
        }
        setUser(null)
      }
    }
    
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch professionals from Supabase with pagination
  useEffect(() => {
    const fetchProfessionals = async () => {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        console.warn('Supabase is not configured. Please set up your environment variables.')
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        // Build query with filters
        let query = buildProfessionalsQuery(true) // Get total count for pagination

        // CRITICAL: Only show visible profiles in search results (industry best practice)
        // Users can always see their own profile even if hidden (handled by RLS)
        if (checkIsVisibleColumnExists()) {
          query = query.eq('is_visible', true)
        }

        // Apply filters
        if (filters.category && filters.category !== 'all') {
          query = query.eq('category', filters.category)
        }
        
        // Minimum rating filter
        if (filters.minRating) {
          query = query.gte('rating', filters.minRating)
        }
        
        // Verified filter
        if (filters.verified) {
          query = query.eq('verified', true)
        }
        
        // Improved search: search across name, profession, description, and location
        if (filters.search || filters.profession) {
          const searchTerm = filters.search || filters.profession || ''
          // Use OR filter to search across multiple fields
          // Format: field1.ilike.term,field2.ilike.term
          query = query.or(`name.ilike.%${searchTerm}%,profession.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
        } else if (filters.location) {
          // If only location filter (no search), search location field
          query = query.ilike('location', `%${filters.location}%`)
        }

        // Apply sorting based on sortBy state
        switch (sortBy) {
          case 'rating-desc':
            // Highest Rated: Verified first, then by rating
            query = query.order('verified', { ascending: false })
                        .order('rating', { ascending: false })
                        .order('created_at', { ascending: false })
            break
          case 'verified-first':
            // Verified First: Verified professionals first, then by rating
            query = query.order('verified', { ascending: false })
                        .order('rating', { ascending: false })
                        .order('experience', { ascending: false })
            break
          case 'newest':
            // Newest First
            query = query.order('created_at', { ascending: false })
            break
          case 'experience-desc':
            // Most Experienced
            query = query.order('experience', { ascending: false })
                        .order('rating', { ascending: false })
            break
          default:
            // Default: Newest First
            query = query.order('created_at', { ascending: false })
        }

        // Apply pagination
        const from = (currentPage - 1) * itemsPerPage
        const to = from + itemsPerPage - 1
        
        let { data, error, count } = await query
          .range(from, to)

        // If error is due to missing is_visible column, retry without the filter
        if (error && isMissingColumnError(error)) {
          setIsVisibleColumnExists(false)
          
          // Only log once per session to avoid console spam
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (!(window as any).__isVisibleColumnWarningShown) {
            console.warn('ℹ️ is_visible column not found. Fetching all profiles. Run database/add-is-visible-field.sql migration to enable visibility filtering.')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).__isVisibleColumnWarningShown = true
          }
          // Rebuild query without is_visible filter
          query = buildProfessionalsQuery(true)
          
          // Reapply all filters except is_visible
          if (filters.category && filters.category !== 'all') {
            query = query.eq('category', filters.category)
          }
          if (filters.minRating) {
            query = query.gte('rating', filters.minRating)
          }
          if (filters.verified) {
            query = query.eq('verified', true)
          }
          if (filters.search || filters.profession) {
            const searchTerm = filters.search || filters.profession || ''
            query = query.or(`name.ilike.%${searchTerm}%,profession.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
          } else if (filters.location) {
            query = query.ilike('location', `%${filters.location}%`)
          }
          
          // Reapply sorting
          switch (sortBy) {
            case 'rating-desc':
              query = query.order('verified', { ascending: false })
                          .order('rating', { ascending: false })
                          .order('created_at', { ascending: false })
              break
            case 'verified-first':
              query = query.order('verified', { ascending: false })
                          .order('rating', { ascending: false })
                          .order('experience', { ascending: false })
              break
            default:
              query = query.order('created_at', { ascending: false })
          }
          
          // Retry query
          const retryResult = await query.range(from, to)
          data = retryResult.data
          error = retryResult.error
          count = retryResult.count
        }

        if (error) {
          console.error('Error fetching professionals:', error)
          setLoading(false)
          return
        }

        // Type assertion for the data
        const professionalsData = (data || []) as SupabaseProfessional[]

        // Transform data to match Professional interface
        const transformedData: Professional[] = professionalsData.map(prof => ({
          id: prof.id,
          name: prof.name,
          profession: prof.profession,
          category: prof.category as Professional['category'],
          email: prof.email,
          phone: prof.phone,
          location: prof.location,
          experience: prof.experience,
          rating: prof.rating,
          description: prof.description,
          services: prof.services?.map((s) => s.service_name) || [],
          availability: prof.availability,
          imageUrl: prof.image_url || undefined,
          verified: prof.verified,
          createdAt: prof.created_at
        }))
        setProfessionals(transformedData)
        setTotalItems(count || 0)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfessionals()
  }, [currentPage, itemsPerPage, filters, sortBy])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }, [])

  const totalPages = useMemo(() => Math.ceil(totalItems / itemsPerPage), [totalItems, itemsPerPage])

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const handleViewProfile = useCallback((id: string) => {
    window.location.href = `/profile/${id}`
  }, [])

  const handleHeroSearch = useCallback(
    debounce((query: string, category: string, location: string) => {
      const newFilters: SearchFiltersType = {}
      if (query) newFilters.search = query
      if (category && category !== 'all') newFilters.category = category
      if (location) newFilters.location = location
      
      setFilters(newFilters)
      setCurrentPage(1)
      
      // Scroll to results section
      const resultsSection = document.getElementById('results-section')
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' })
      }
    }, 300),
    []
  )

  const handleSortChange = useCallback((value: SortOption) => {
    setSortBy(value)
    setCurrentPage(1) // Reset to first page when sorting changes
  }, [])

  const hasActiveFilters = useMemo(() => 
    Object.values(filters).some(value => 
      value !== undefined && value !== '' && value !== false
    ),
    [filters]
  )

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
      <HomeContent 
        filters={filters}
        setFilters={setFilters}
        professionals={professionals}
        loading={loading}
        user={user}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        sortBy={sortBy}
        setSortBy={setSortBy}
        handleSignOut={handleSignOut}
        handleViewProfile={handleViewProfile}
        handleHeroSearch={handleHeroSearch}
        handleSortChange={handleSortChange}
        hasActiveFilters={hasActiveFilters}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        handleItemsPerPageChange={handleItemsPerPageChange}
      />
    </Suspense>
  )
}

function HomeContent({
  filters,
  setFilters,
  professionals,
  loading,
  user,
  currentPage,
  setCurrentPage,
  totalItems,
  itemsPerPage,
  sortBy,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSortBy,
  handleSignOut,
  handleViewProfile,
  handleHeroSearch,
  handleSortChange,
  hasActiveFilters,
  totalPages,
  handlePageChange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleItemsPerPageChange
}: {
  filters: SearchFiltersType
  setFilters: (filters: SearchFiltersType) => void
  professionals: Professional[]
  loading: boolean
  user: User | null
  currentPage: number
  setCurrentPage: (page: number) => void
  totalItems: number
  itemsPerPage: number
  sortBy: SortOption
  setSortBy: (sort: SortOption) => void
  handleSignOut: () => void
  handleViewProfile: (id: string) => void
  handleHeroSearch: (query: string, category: string, location: string) => void
  handleSortChange: (value: SortOption) => void
  hasActiveFilters: boolean
  totalPages: number
  handlePageChange: (page: number) => void
  handleItemsPerPageChange: (items: number) => void
}) {
  const searchParams = useSearchParams()

  // Parse URL parameters on mount and when they change
  useEffect(() => {
    const category = searchParams?.get('category')
    const location = searchParams?.get('location')
    const search = searchParams?.get('search')
    
    if (category || location || search) {
      const newFilters: SearchFiltersType = {}
      if (category && category !== 'all') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newFilters.category = category as any
      }
      if (location) {
        newFilters.location = location
      }
      if (search) {
        newFilters.search = search
      }
      setFilters(newFilters)
      setCurrentPage(1)
      
      // Scroll to results section after a short delay
      setTimeout(() => {
        const resultsSection = document.getElementById('results-section')
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }, [searchParams, setFilters, setCurrentPage])

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData type="Organization" />
      <StructuredData type="WebSite" />
      <StructuredData type="ItemList" professionals={professionals.slice(0, 10)} />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Professional Header */}
        <Header user={user} onSignOut={handleSignOut} />

      {/* Hero Section with Search - Full viewport height on desktop */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50/40 py-12 sm:py-16 lg:min-h-screen lg:flex lg:items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <HeroSearch onSearch={handleHeroSearch} />
        </div>
      </section>

      {/* Main Search Results Section - Immediately after hero for immediate value */}
      <section id="results-section" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-20 lg:top-24">
                <SearchFilters 
                  filters={filters} 
                  onFiltersChange={setFilters} 
                />
              </div>
            </aside>

            <main className="lg:col-span-3 order-1 lg:order-2">
            {/* Results Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                    <h2 className="text-xl sm:text-2xl font-bold sm:font-extrabold text-gray-900">
                      {totalItems} Result{totalItems !== 1 ? 's' : ''}
                    </h2>
                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700 hidden sm:block">Sort:</label>
                      <Select value={sortBy} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm border-gray-300 bg-white hover:bg-gray-50">
                          <SelectValue>
                            {sortBy === 'newest' && '🕐 Newest First'}
                            {sortBy === 'rating-desc' && '⭐ Highest Rated'}
                            {sortBy === 'verified-first' && '✓ Verified First'}
                            {sortBy === 'experience-desc' && '🏆 Most Experienced'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-600" />
                              <span>Newest First</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="rating-desc">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>Highest Rated</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="verified-first">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Verified First</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="experience-desc">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-indigo-600" />
                              <span>Most Experienced</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    {filters.category && filters.category !== 'all' && (
                      <span className="inline-flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 border-2 border-indigo-200">
                          {filters.category === 'doctor' ? 'Doctors' : 
                           filters.category === 'engineer' ? 'Engineers' :
                           filters.category === 'plumber' ? 'Plumbers' :
                           filters.category === 'electrician' ? 'Electricians' :
                           filters.category === 'maid' ? 'Maids & Cleaners' :
                           filters.category === 'designer' ? 'Designers' :
                           filters.category === 'consultant' ? 'Consultants' :
                           filters.category === 'therapist' ? 'Therapists' :
                           filters.category === 'lawyer' ? 'Lawyers' :
                           filters.category === 'accountant' ? 'Accountants' : 'Other'}
                        </Badge>
                      </span>
                    )}
                    {(filters.location || filters.search || filters.profession) && (
                      <Badge variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 border-2 border-indigo-200">
                        <MapPin className="h-3 w-3 mr-1" />
                        {filters.location || filters.search || filters.profession}
                      </Badge>
                    )}
                    {filters.minRating && (
                      <Badge variant="secondary" className="text-xs bg-yellow-50 text-yellow-700 border-2 border-yellow-200">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        {filters.minRating}+
                      </Badge>
                    )}
                    {filters.verified && (
                      <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-2 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                {hasActiveFilters && (
                    <Button 
                    variant="outline" 
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 group self-start sm:self-auto"
                    onClick={() => {
                      setFilters({})
                      setCurrentPage(1)
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="text-center py-12 sm:py-20 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : !isSupabaseConfigured() ? (
              <div className="text-center py-16 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Database Not Configured</h3>
                <p className="text-sm text-gray-700">
                  Configure Supabase to connect to the database
                </p>
              </div>
            ) : professionals.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Try adjusting your filters
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setFilters({})}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {professionals.map((professional: Professional) => (
                  <ProfessionalCard
                    key={professional.id}
                    professional={professional}
                    onViewProfile={handleViewProfile}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {professionals.length > 0 && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
          </main>
        </div>
      </div>
      </section>

      {/* Popular Categories - Moved below results */}
      <PopularCategories />

      {/* Statistics - Trust signals below results */}
      <Statistics />

      {/* Featured Professionals - Social proof below results */}
      <FeaturedProfessionals />

      {/* How It Works - Moved down after results (industry standard) */}
      <HowItWorks />

      {/* Testimonials */}
      <Testimonials />

      {/* Footer */}
      <footer className="bg-gray-50 border-t-2 border-gray-300 mt-16 lg:mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-block mb-3">
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Siscora Pro
                </h3>
              </Link>
              <p className="text-sm text-gray-600 mb-4">
                Connect with trusted professionals in your area. Find the best experts for your needs.
              </p>
            </div>

            {/* For Users */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4">For Users</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Browse Professionals
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    My Profile
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Professionals */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">For Professionals</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/add-profile" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Add Your Profile
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Manage Profile
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Settings
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal & Support */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4">Legal & Support</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/how-it-works" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <span className="text-sm text-gray-500">Terms of Service</span>
                </li>
                <li>
                  <span className="text-sm text-gray-500">Privacy Policy</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t-2 border-gray-300 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} Siscora Pro
              </p>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  )
}
