'use client'

import { SearchFilters as SearchFiltersType } from '@/types/directory'
import { categories, professions } from '@/data/mockData'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, X } from 'lucide-react'

interface SearchFiltersProps {
  filters: SearchFiltersType
  onFiltersChange: (filters: SearchFiltersType) => void
}

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const updateFilter = (key: keyof SearchFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== false
  )

  return (
    <div className="space-y-4 p-4 bg-white border border-gray-200 rounded-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Search Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-sm"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by profession..."
            value={filters.profession || ''}
            onChange={(e) => updateFilter('profession', e.target.value)}
            className="pl-10 border-gray-300 rounded-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-gray-700">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.value}
                variant={filters.category === category.value ? "default" : "outline"}
                className={`cursor-pointer rounded-sm ${
                  filters.category === category.value 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => updateFilter('category', 
                  filters.category === category.value ? undefined : category.value
                )}
              >
                {category.label}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-gray-700">Location</label>
          <Input
            placeholder="Enter location..."
            value={filters.location || ''}
            onChange={(e) => updateFilter('location', e.target.value)}
            className="border-gray-300 rounded-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-gray-700">Minimum Rating</label>
          <div className="flex gap-2">
            {[3, 4, 4.5, 4.8].map((rating) => (
              <Badge
                key={rating}
                variant={filters.minRating === rating ? "default" : "outline"}
                className={`cursor-pointer rounded-sm ${
                  filters.minRating === rating 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => updateFilter('minRating', 
                  filters.minRating === rating ? undefined : rating
                )}
              >
                {rating}+ ⭐
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="verified"
            checked={filters.verified || false}
            onChange={(e) => updateFilter('verified', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="verified" className="text-sm font-medium cursor-pointer text-gray-700">
            Verified Professionals Only
          </label>
        </div>
      </div>
    </div>
  )
}
