'use client'

import { useState, useMemo } from 'react'
import { mockProfessionals } from '@/data/mockData'
import { ProfessionalCard } from '@/components/ProfessionalCard'
import { SearchFilters } from '@/components/SearchFilters'
import { SearchFilters as SearchFiltersType } from '@/types/directory'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
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

  const handleViewProfile = (id: string) => {
    window.location.href = `/profile/${id}`
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Professional Directory</h1>
              <p className="text-muted-foreground">Find trusted professionals in your area</p>
            </div>
            <Link href="/add-profile">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your Profile
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <SearchFilters 
              filters={filters} 
              onFiltersChange={setFilters} 
            />
          </aside>

          <main className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                {filteredProfessionals.length} Professional{filteredProfessionals.length !== 1 ? 's' : ''} Found
              </h2>
            </div>

            {filteredProfessionals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No professionals found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setFilters({})}
                >
                  Clear Filters
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
