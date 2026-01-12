'use client'

import { useState, useMemo } from 'react'
import { mockProfessionals, categories } from '@/data/mockData'
import { ProfessionalCard } from '@/components/ProfessionalCard'
import { SearchFilters } from '@/components/SearchFilters'
import { SearchFilters as SearchFiltersType } from '@/types/directory'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Search, CheckCircle, Star, Clock, MapPin, Mail } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [filters, setFilters] = useState<SearchFiltersType>({})

  const filteredProfessionals = useMemo(() => {
    return mockProfessionals.filter(professional => {
      if (filters.category && filters.category !== 'all' && professional.category !== filters.category) {
        return false
      }
      if (filters.profession && !professional.profession.toLowerCase().includes(filters.profession.toLowerCase())) {
        return false
      }
      if (filters.location && !professional.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false
      }
      if (filters.minRating && professional.rating < filters.minRating) {
        return false
      }
      if (filters.verified && !professional.verified) {
        return false
      }
      return true
    })
  }, [filters])

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== false
  )

  const handleViewProfile = (id: string) => {
    window.location.href = `/profile/${id}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Siscora Connect
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Connect with trusted professionals in your area</p>
            </div>
            <Link href="/add-profile">
              <Button className="modern-button group">
                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                Add Your Profile
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Trust Signals Section */}
      <section className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Verified Professionals</h3>
              <p className="text-sm text-gray-600">All professionals are background checked</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                <Star className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Top Rated</h3>
              <p className="text-sm text-gray-600">4.5+ average rating across all professionals</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                <Clock className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Quick Response</h3>
              <p className="text-sm text-gray-600">Average response time under 24 hours</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                <MapPin className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Local Experts</h3>
              <p className="text-sm text-gray-600">Find professionals near your location</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
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
                    {filteredProfessionals.length} Professional{filteredProfessionals.length !== 1 ? 's' : ''} Found
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {filters.category && filters.category !== 'all' && (
                      <span className="inline-flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-100">
                          {categories.find(c => c.value === filters.category)?.label}
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
            {filteredProfessionals.length === 0 ? (
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
                {filteredProfessionals.map((professional) => (
                  <ProfessionalCard
                    key={professional.id}
                    professional={professional}
                    onViewProfile={handleViewProfile}
                  />
                ))}
              </div>
            )}

            {/* Load More / Pagination */}
            {filteredProfessionals.length > 0 && (
              <div className="mt-12 text-center">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  Load More Professionals
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Siscora Connect</h3>
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
                © 2024 Siscora Connect. All rights reserved.
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
          </div>
        </div>
      </footer>
    </div>
  )
}
