'use client'

import { useState, useMemo, useEffect } from 'react'
import { Professional } from '@/types/directory'
import { ProfessionalCard } from '@/components/ProfessionalCard'
import { SearchFilters } from '@/components/SearchFilters'
import { SearchFilters as SearchFiltersType } from '@/types/directory'
import { Pagination } from '@/components/Pagination'
import { Header } from '@/components/Header'
import { HeroSearch } from '@/components/HeroSearch'
import { PopularCategories } from '@/components/PopularCategories'
import { HowItWorks } from '@/components/HowItWorks'
import { FeaturedProfessionals } from '@/components/FeaturedProfessionals'
import { Testimonials } from '@/components/Testimonials'
import { Statistics } from '@/components/Statistics'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Search, CheckCircle, Star, Clock, MapPin, Mail, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export default function Home() {
  const [filters, setFilters] = useState<SearchFiltersType>({})
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
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
        let query = supabase
          .from('professionals')
          .select(`
            *,
            services (
              service_name
            )
          `, { count: 'exact' }) // Get total count for pagination

        // Apply filters
        if (filters.category && filters.category !== 'all') {
          query = query.eq('category', filters.category)
        }
        
        if (filters.profession) {
          query = query.ilike('profession', `%${filters.profession}%`)
        }
        
        if (filters.location) {
          query = query.ilike('location', `%${filters.location}%`)
        }

        // Apply pagination
        const from = (currentPage - 1) * itemsPerPage
        const to = from + itemsPerPage - 1
        
        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(from, to)

        if (error) {
          console.error('Error fetching professionals:', error)
          setLoading(false)
          return
        }

        console.log('Fetched data:', data) // Debug log
        console.log('Total count:', count) // Debug log

        // Type assertion for the data
        const professionalsData = data as any[]

        // Transform data to match Professional interface
        const transformedData: Professional[] = professionalsData.map(prof => ({
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

        console.log('Transformed data:', transformedData) // Debug log
        setProfessionals(transformedData)
        setTotalItems(count || 0)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfessionals()
  }, [currentPage, itemsPerPage, filters])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const handleViewProfile = (id: string) => {
    window.location.href = `/profile/${id}`
  }

  const handleHeroSearch = (query: string, category: string, location: string) => {
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
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== false
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Professional Header */}
      <Header user={user} onSignOut={handleSignOut} />

      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-16">
        <div className="container mx-auto px-6">
          <HeroSearch onSearch={handleHeroSearch} />
        </div>
      </section>

      {/* Popular Categories */}
      <PopularCategories />

      {/* How It Works */}
      <HowItWorks />

      {/* Featured Professionals */}
      <FeaturedProfessionals />

      {/* Statistics */}
      <Statistics />

      {/* Testimonials */}
      <Testimonials />

      {/* Main Search Results Section */}
      <section id="results-section" className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Browse All Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Search our complete directory of verified professionals
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <div className="sticky top-24">
                <SearchFilters 
                  filters={filters} 
                  onFiltersChange={setFilters} 
                />
              </div>
            </aside>

            <main className="lg:col-span-3">
            {/* Results Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {totalItems} Professional{totalItems !== 1 ? 's' : ''} Found
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {filters.category && filters.category !== 'all' && (
                      <span className="inline-flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-100">
                          {filters.category === 'doctor' ? 'Doctors' : 
                           filters.category === 'engineer' ? 'Engineers' :
                           filters.category === 'plumber' ? 'Plumbers' :
                           filters.category === 'electrician' ? 'Electricians' :
                           filters.category === 'maid' ? 'Maids & Cleaners' : 'Other'}
                        </Badge>
                      </span>
                    )}
                    {filters.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {filters.location}
                      </span>
                    )}
                    {filters.minRating && (
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {filters.minRating}+ Rating
                      </span>
                    )}
                    {filters.verified && (
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        Verified Only
                      </span>
                    )}
                  </div>
                </div>
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 group"
                    onClick={() => setFilters({})}
                  >
                    <X className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Loading Professionals</h3>
                <p className="text-gray-600 max-w-lg mx-auto text-lg">
                  Fetching the latest professionals from our database...
                </p>
              </div>
            ) : !isSupabaseConfigured() ? (
              <div className="text-center py-20 bg-yellow-50 rounded-2xl border border-yellow-200">
                <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-4xl">⚠️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Database Not Configured</h3>
                <p className="text-gray-700 max-w-lg mx-auto text-lg mb-6">
                  Please set up your Supabase environment variables to connect to the database.
                </p>
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 max-w-md mx-auto">
                  <h4 className="font-semibold text-gray-900 mb-2">Setup Instructions:</h4>
                  <ol className="text-left text-sm text-gray-700 space-y-2 list-decimal">
                    <li>Go to <a href="https://supabase.com" target="_blank" className="text-indigo-600 hover:text-indigo-700">supabase.com</a></li>
                    <li>Create a new project or use your existing one</li>
                    <li>Go to Settings → API</li>
                    <li>Copy your Project URL and Anon Key</li>
                    <li>Create a <code>.env.local</code> file in your project root</li>
                    <li>Add these lines:
                      <pre className="bg-gray-800 text-green-400 p-2 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`}</pre>
                    </li>
                    <li>Restart your development server</li>
                  </ol>
                </div>
              </div>
            ) : professionals.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Search className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No professionals found</h3>
                <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg">
                  Try adjusting your filters or search criteria to find more professionals. We're constantly adding new experts to our directory.
                </p>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => setFilters({})}
                  >
                    Clear All Filters
                  </Button>
                  <div className="text-sm text-gray-500">
                    Or <Link href="/add-profile" className="text-indigo-600 hover:text-indigo-700 font-medium">add your profile</Link> to be the first professional in this category
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Khojix
                </h3>
                <p className="text-sm text-gray-500 font-medium">by Siscora.com</p>
              </div>
              <p className="text-sm text-gray-600 mb-4">Connecting trusted professionals with communities worldwide.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>contact@siscora.com</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Browse Professionals
                  </Link>
                </li>
                <li>
                  <Link href="/add-profile" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Add Your Profile
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/?category=doctor" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Doctors & Healthcare
                  </Link>
                </li>
                <li>
                  <Link href="/?category=engineer" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Engineers & Tech
                  </Link>
                </li>
                <li>
                  <Link href="/?category=plumber" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Plumbers & Home Services
                  </Link>
                </li>
                <li>
                  <Link href="/?category=electrician" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Electricians & Electrical
                  </Link>
                </li>
                <li>
                  <Link href="/?category=maid" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Maids & Cleaning Services
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 pt-8 mt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                2024 Khojix. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <Link href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Privacy
                </Link>
                <span className="text-gray-400">•</span>
                <Link href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Terms
                </Link>
                <span className="text-gray-400">•</span>
                <Link href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Contact
                </Link>
              </div>
            </div>
            {/* Free Profile CTA */}
            <div className="border-t border-gray-200 pt-6 mt-6 text-center">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                <p className="text-sm text-gray-700 mb-3">
                  <span className="font-semibold text-indigo-900"> Ready to grow your business?</span>
                </p>
                <Link href="/add-profile">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 hover:border-indigo-700 text-sm px-6">
                    Add Your Free Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
