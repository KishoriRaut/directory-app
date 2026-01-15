'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Search, 
  MapPin, 
  Navigation, 
  Loader2, 
  X, 
  Star, 
  CheckCircle, 
  SlidersHorizontal,
  Filter,
  Clock,
  Award
} from 'lucide-react'
import { categories } from '@/lib/constants'
import { SearchFilters as SearchFiltersType } from '@/types/directory'
import { debounce } from '@/lib/performance'

interface ComprehensiveSearchFiltersProps {
  filters: SearchFiltersType
  onFiltersChange: (filters: SearchFiltersType) => void
  onSearch?: () => void
}

// Common cities for autocomplete
const commonCities = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
  'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
  'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Boston, MA',
  'Miami, FL', 'Nashville, TN', 'Portland, OR', 'Atlanta, GA', 'Las Vegas, NV'
]

// Experience ranges
const experienceRanges = [
  { value: 'all', label: 'Any Experience' },
  { value: '0-2', label: '0-2 Years' },
  { value: '3-5', label: '3-5 Years' },
  { value: '6-10', label: '6-10 Years' },
  { value: '11-15', label: '11-15 Years' },
  { value: '16+', label: '16+ Years' }
]

// Sort options
const sortOptions = [
  { value: 'newest', label: 'Newest First', icon: Clock },
  { value: 'rating-desc', label: 'Highest Rated', icon: Star },
  { value: 'verified-first', label: 'Verified First', icon: CheckCircle },
  { value: 'experience-desc', label: 'Most Experienced', icon: Award }
]

export function ComprehensiveSearchFilters({ 
  filters, 
  onFiltersChange,
  onSearch 
}: ComprehensiveSearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(filters.search || filters.profession || '')
  const [location, setLocation] = useState(filters.location || '')
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [minExperience, setMinExperience] = useState<string>('all')
  const [maxExperience, setMaxExperience] = useState<string>('all')
  
  const locationInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const locationDebounceRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced search update
  const updateSearchFilter = useCallback((value: string) => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }
    
    searchDebounceRef.current = setTimeout(() => {
      onFiltersChange({
        ...filters,
        search: value || undefined,
        profession: value || undefined
      })
    }, 300)
  }, [filters, onFiltersChange])

  // Debounced location update
  const updateLocationFilter = useCallback((value: string) => {
    if (locationDebounceRef.current) {
      clearTimeout(locationDebounceRef.current)
    }
    
    locationDebounceRef.current = setTimeout(() => {
      onFiltersChange({
        ...filters,
        location: value || undefined
      })
    }, 300)
  }, [filters, onFiltersChange])

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    updateSearchFilter(value)
  }

  // Handle location input with autocomplete
  const handleLocationChange = (value: string) => {
    setLocation(value)
    updateLocationFilter(value)
    
    if (value.length > 0) {
      const filtered = commonCities.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5)
      setLocationSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setLocationSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Handle location selection from autocomplete
  const handleLocationSelect = (selectedLocation: string) => {
    setLocation(selectedLocation)
    setShowSuggestions(false)
    onFiltersChange({
      ...filters,
      location: selectedLocation
    })
    if (locationInputRef.current) {
      locationInputRef.current.blur()
    }
  }

  // Get user's current location
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Please enter your location manually.')
      return
    }

    setIsGettingLocation(true)
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
          )
          
          if (!response.ok) {
            throw new Error('Reverse geocoding failed')
          }
          
          const data = await response.json()
          const cityName = data.city || data.locality || data.principalSubdivision || 'Unknown Location'
          const state = data.principalSubdivision ? `, ${data.principalSubdivision}` : ''
          const fullLocation = `${cityName}${state}`
          
          setLocation(fullLocation)
          onFiltersChange({
            ...filters,
            location: fullLocation
          })
          setIsGettingLocation(false)
        } catch {
          const lat = position.coords.latitude.toFixed(4)
          const lon = position.coords.longitude.toFixed(4)
          const fullLocation = `${lat}, ${lon}`
          setLocation(fullLocation)
          onFiltersChange({
            ...filters,
            location: fullLocation
          })
          setIsGettingLocation(false)
        }
      },
      (error) => {
        setIsGettingLocation(false)
        if (error.code === error.PERMISSION_DENIED) {
          alert('Location access denied. Please enable location permissions in your browser settings.')
        }
      },
      options
    )
  }

  // Handle category change
  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      category: value === 'all' ? undefined : value
    })
  }

  // Handle rating change
  const handleRatingChange = (value: string) => {
    onFiltersChange({
      ...filters,
      minRating: value === 'all' ? undefined : parseFloat(value)
    })
  }

  // Handle verified toggle
  const handleVerifiedToggle = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      verified: checked || undefined
    })
  }

  // Handle experience change
  const handleExperienceChange = (type: 'min' | 'max', value: string) => {
    if (type === 'min') {
      setMinExperience(value)
    } else {
      setMaxExperience(value)
    }
    
    // Parse experience ranges and update filters
    // This would need to be implemented based on your data structure
    // For now, we'll just store the preference
  }

  // Handle sort change
  const handleSortChange = (value: string) => {
    // Sort is handled separately, but we can trigger a callback if needed
    if (onSearch) {
      onSearch()
    }
  }

  // Clear all filters
  const handleClearAll = () => {
    setSearchQuery('')
    setLocation('')
    setMinExperience('all')
    setMaxExperience('all')
    onFiltersChange({})
  }

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== false
  )

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        locationInputRef.current &&
        !locationInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup debounce timers
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
      if (locationDebounceRef.current) {
        clearTimeout(locationDebounceRef.current)
      }
    }
  }, [])

  // Sync with external filter changes
  useEffect(() => {
    setSearchQuery(filters.search || filters.profession || '')
    setLocation(filters.location || '')
  }, [filters.search, filters.profession, filters.location])

  return (
    <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
      {/* Main Search Bar */}
      <div className="space-y-4">
        {/* Primary Search Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search professionals, services, skills..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && onSearch) {
                  onSearch()
                }
              }}
              className="pl-12 h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg"
            />
          </div>

          {/* Location Input */}
          <div className="relative w-full sm:w-64">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <Input
              ref={locationInputRef}
              placeholder="Location"
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              onFocus={() => location.length > 0 && setShowSuggestions(true)}
              className="pl-12 pr-12 h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleUseMyLocation}
              disabled={isGettingLocation}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-2 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded"
              title="Use my current location"
            >
              {isGettingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
            </Button>
            
            {/* Location Autocomplete Suggestions */}
            {showSuggestions && locationSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto"
              >
                {locationSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleLocationSelect(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 flex items-center gap-3 text-sm transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <Button
            onClick={onSearch}
            className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
          >
            <Search className="h-5 w-5 mr-2" />
            Search
          </Button>
        </div>

        {/* Quick Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Category Filter */}
          <div className="flex-1 sm:flex-initial sm:w-48">
            <Select 
              value={filters.category || 'all'} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full h-11 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rating Filter */}
          <div className="flex-1 sm:flex-initial sm:w-48">
            <Select 
              value={filters.minRating ? filters.minRating.toString() : 'all'} 
              onValueChange={handleRatingChange}
            >
              <SelectTrigger className="w-full h-11 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                <SelectValue placeholder="Any Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Rating</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="3.5">3.5+ Stars</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
                <SelectItem value="5">5 Stars Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Verified Filter */}
          <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Checkbox
              id="verified-filter"
              checked={filters.verified || false}
              onCheckedChange={handleVerifiedToggle}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label 
              htmlFor="verified-filter" 
              className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4 text-green-600" />
              Verified Only
            </label>
          </div>

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="h-11 px-4 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {showAdvancedFilters ? 'Less' : 'More'} Filters
          </Button>
        </div>

        {/* Advanced Filters Section */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-gray-200 space-y-4 animate-in slide-in-from-top-2">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Min Experience */}
              <div className="flex-1 sm:flex-initial sm:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Experience
                </label>
                <Select value={minExperience} onValueChange={(v) => handleExperienceChange('min', v)}>
                  <SelectTrigger className="w-full h-11 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Max Experience */}
              <div className="flex-1 sm:flex-initial sm:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Experience
                </label>
                <Select value={maxExperience} onValueChange={(v) => handleExperienceChange('max', v)}>
                  <SelectTrigger className="w-full h-11 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Options */}
              <div className="flex-1 sm:flex-initial sm:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <Select value="newest" onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full h-11 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-gray-600" />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Active Filters:
              </span>
              
              {filters.category && filters.category !== 'all' && (
                <Badge variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  {categories.find(c => c.value === filters.category)?.label}
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className="ml-1 hover:text-indigo-900"
                    aria-label="Remove category filter"
                    title="Remove category filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {filters.location && (
                <Badge variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {filters.location}
                  <button
                    onClick={() => {
                      setLocation('')
                      updateLocationFilter('')
                    }}
                    className="ml-1 hover:text-indigo-900"
                    aria-label="Remove location filter"
                    title="Remove location filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {filters.search && (
                <Badge variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  {filters.search}
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      updateSearchFilter('')
                    }}
                    className="ml-1 hover:text-indigo-900"
                    aria-label="Remove search filter"
                    title="Remove search filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {filters.minRating && (
                <Badge variant="secondary" className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  {filters.minRating}+ Rating
                  <button
                    onClick={() => handleRatingChange('all')}
                    className="ml-1 hover:text-yellow-900"
                    aria-label="Remove rating filter"
                    title="Remove rating filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {filters.verified && (
                <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                  <button
                    onClick={() => handleVerifiedToggle(false)}
                    className="ml-1 hover:text-green-900"
                    aria-label="Remove verified filter"
                    title="Remove verified filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="ml-auto border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
