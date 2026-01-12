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
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Search Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by profession..."
            value={filters.profession || ''}
            onChange={(e) => updateFilter('profession', e.target.value)}
            className="pl-10"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.value}
                variant={filters.category === category.value ? "default" : "outline"}
                className="cursor-pointer"
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
          <label className="text-sm font-medium mb-2 block">Location</label>
          <Input
            placeholder="Enter location..."
            value={filters.location || ''}
            onChange={(e) => updateFilter('location', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
          <div className="flex gap-2">
            {[3, 4, 4.5, 4.8].map((rating) => (
              <Badge
                key={rating}
                variant={filters.minRating === rating ? "default" : "outline"}
                className="cursor-pointer"
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
            className="rounded"
          />
          <label htmlFor="verified" className="text-sm font-medium cursor-pointer">
            Verified Professionals Only
          </label>
        </div>
      </div>
    </div>
  )
}
