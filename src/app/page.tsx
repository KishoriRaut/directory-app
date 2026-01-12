'use client'

import { useState, useMemo } from 'react'
import { mockProfessionals, categories } from '@/data/mockData'
import { ProfessionalCard } from '@/components/ProfessionalCard'
import { SearchFilters } from '@/components/SearchFilters'
import { SearchFilters as SearchFiltersType } from '@/types/directory'
import { Button } from '@/components/ui/button'
import { Plus, X, Search } from 'lucide-react'
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
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Professional Directory
              </h1>
              <p className="text-gray-600 mt-1">Connect with trusted professionals in your area</p>
            </div>
            <Link href="/add-profile">
              <Button className="modern-button">
                <Plus className="h-4 w-4" />
                Add Your Profile
              </Button>
            </Link>
          </div>
        </div>
      </header>

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
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {filteredProfessionals.length} Professional{filteredProfessionals.length !== 1 ? 's' : ''} Found
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {filters.category && filters.category !== 'all' && `${categories.find(c => c.value === filters.category)?.label} • `}
                    {filters.location && `${filters.location} • `}
                    {filters.minRating && `${filters.minRating}+ ⭐ • `}
                    {filters.verified && 'Verified Only'}
                  </p>
                </div>
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => setFilters({})}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {filteredProfessionals.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No professionals found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Try adjusting your filters or search criteria to find more professionals.
                </p>
                <Button 
                  variant="outline" 
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setFilters({})}
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProfessionals.map((professional) => (
                  <ProfessionalCard
                    key={professional.id}
                    professional={professional}
                    onViewProfile={handleViewProfile}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
