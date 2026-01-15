'use client'

import { memo, useMemo, useCallback, useState, useEffect, useRef } from 'react'
import { SearchFilters as SearchFiltersType } from '@/types/directory'
import { categories } from '@/lib/constants'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, X, MapPin, Star, CheckCircle } from 'lucide-react'
import { debounce } from '@/lib/performance'

interface SearchFiltersProps {
  filters: SearchFiltersType
  onFiltersChange: (filters: SearchFiltersType | ((prev: SearchFiltersType) => SearchFiltersType)) => void
}

export const SearchFilters = memo(function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  // Local state for search and location inputs
  const [searchQuery, setSearchQuery] = useState(() => filters.search || filters.profession || '')
  const [locationQuery, setLocationQuery] = useState(() => filters.location || '')
  
  // Store callback in ref to prevent debounced function recreation
  const onFiltersChangeRef = useRef(onFiltersChange)
  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange
  }, [onFiltersChange])

  // Debounced filter update for search and location inputs
  const debouncedUpdateSearch = useMemo(
    () => debounce((value: string) => {
      onFiltersChangeRef.current((prevFilters) => {
        const newFilters: SearchFiltersType = { ...prevFilters }
        if (value) {
          newFilters.search = value
          newFilters.profession = value
        } else {
          delete newFilters.search
          delete newFilters.profession
        }
        return newFilters
      })
    }, 400),
    []
  )

  const debouncedUpdateLocation = useMemo(
    () => debounce((value: string) => {
      onFiltersChangeRef.current((prevFilters) => {
        return { ...prevFilters, location: value || undefined }
      })
    }, 400),
    []
  )

  // Sync local state with external filters
  // Use ref to prevent infinite loops in StrictMode
  const syncInProgressRef = useRef(false)
  
  useEffect(() => {
    // Prevent sync during internal updates
    if (syncInProgressRef.current) return
    
    const externalSearch = filters.search || filters.profession || ''
    const externalLocation = filters.location || ''
    
    // Only update if values actually changed to prevent loops
    if (externalSearch !== searchQuery) {
      setSearchQuery(externalSearch)
    }
    if (externalLocation !== locationQuery) {
      setLocationQuery(externalLocation)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.profession, filters.location])

  // Immediate filter update for non-text inputs (badges, checkboxes)
  const updateFilter = useCallback((key: keyof SearchFiltersType, value: any) => {
    onFiltersChange((prevFilters) => {
      return { ...prevFilters, [key]: value }
    })
  }, [onFiltersChange])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setLocationQuery('')
    onFiltersChange({})
  }, [onFiltersChange])

  const hasActiveFilters = useMemo(() => 
    Object.values(filters).some(value => 
      value !== undefined && value !== '' && value !== false
    ),
    [filters]
  )

  const getActiveFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== '' && value !== false
    ).length
  }, [filters])

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-sm">
      {/* Header with Active Filter Count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <p className="text-xs text-gray-600 mt-1">
              {getActiveFiltersCount} active
            </p>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors touch-target w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Search Input */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-900">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search professionals..."
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value
              setSearchQuery(value)
              debouncedUpdateSearch(value)
            }}
            className="pl-10 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 h-11"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-2 sm:space-y-3">
        <label className="text-xs sm:text-sm font-semibold text-gray-900">Category</label>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
          {categories.map((category) => (
            <Badge
              key={category.value}
              variant={filters.category === category.value ? "default" : "outline"}
              className={`cursor-pointer rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-all touch-target ${
                filters.category === category.value 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
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

      {/* Location Filter */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-900">Location</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="City or location"
            value={locationQuery}
            onChange={(e) => {
              const value = e.target.value
              setLocationQuery(value)
              debouncedUpdateLocation(value)
            }}
            className="pl-10 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 h-11"
          />
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-2 sm:space-y-3">
        <label className="text-xs sm:text-sm font-semibold text-gray-900">Minimum Rating</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[3, 4, 4.5, 5].map((rating) => (
            <Badge
              key={rating}
              variant={filters.minRating === rating ? "default" : "outline"}
              className={`cursor-pointer rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-all touch-target ${
                filters.minRating === rating 
                  ? 'bg-yellow-500 text-white border-yellow-500 shadow-sm' 
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
              }`}
              onClick={() => updateFilter('minRating', 
                filters.minRating === rating ? undefined : rating
              )}
            >
              <div className="flex items-center gap-1 justify-center">
                <Star className="h-3 w-3 fill-current" />
                <span>{rating}+</span>
              </div>
            </Badge>
          ))}
        </div>
      </div>

      {/* Additional Filters */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-gray-900">Options</label>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="verified"
            checked={filters.verified || false}
            onChange={(e) => updateFilter('verified', e.target.checked)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="verified" className="text-sm font-medium cursor-pointer text-gray-900 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Verified Only
          </label>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.category && filters.category !== 'all' && (
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                {categories.find(c => c.value === filters.category)?.label}
                <button
                  onClick={() => updateFilter('category', undefined)}
                  className="ml-2 text-indigo-500 hover:text-indigo-700"
                  aria-label="Remove category filter"
                  title="Remove category filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.location && (
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                <MapPin className="h-3 w-3 mr-1" />
                {filters.location}
                <button
                  onClick={() => updateFilter('location', undefined)}
                  className="ml-2 text-indigo-500 hover:text-indigo-700"
                  aria-label="Remove location filter"
                  title="Remove location filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.minRating && (
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                <Star className="h-3 w-3 mr-1 fill-current" />
                {filters.minRating}+ Rating
                <button
                  onClick={() => updateFilter('minRating', undefined)}
                  className="ml-2 text-indigo-500 hover:text-indigo-700"
                  aria-label="Remove rating filter"
                  title="Remove rating filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.verified && (
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified Only
                <button
                  onClick={() => updateFilter('verified', undefined)}
                  className="ml-2 text-indigo-500 hover:text-indigo-700"
                  aria-label="Remove verified filter"
                  title="Remove verified filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if filters actually change
  const prevFilters = JSON.stringify(prevProps.filters)
  const nextFilters = JSON.stringify(nextProps.filters)
  return prevFilters === nextFilters
})
