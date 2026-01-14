'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin, Navigation, Loader2 } from 'lucide-react'

interface HeroSearchProps {
  onSearch: (query: string, category: string, location: string) => void
}

// Common cities for autocomplete
const commonCities = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
  'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
  'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Boston, MA'
]

// Popular searches with icons
const popularSearches = [
  { term: 'Plumbers', icon: '🔧', category: 'plumber' },
  { term: 'Electricians', icon: '⚡', category: 'electrician' },
  { term: 'Engineers', icon: '👷', category: 'engineer' },
  { term: 'Designers', icon: '🎨', category: 'designer' },
  { term: 'Lawyers', icon: '⚖️', category: 'lawyer' },
  { term: 'Doctors', icon: '👨‍⚕️', category: 'doctor' }
]

export function HeroSearch({ onSearch }: HeroSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const locationInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Handle location input with autocomplete
  const handleLocationChange = (value: string) => {
    setLocation(value)
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
      timeout: 10000, // 10 seconds timeout
      maximumAge: 0 // Don't use cached location
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocoding to get city name
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
          )
          
          if (!response.ok) {
            throw new Error('Reverse geocoding failed')
          }
          
          const data = await response.json()
          const cityName = data.city || data.locality || data.principalSubdivision || 'Unknown Location'
          const state = data.principalSubdivision ? `, ${data.principalSubdivision}` : ''
          setLocation(`${cityName}${state}`)
          setIsGettingLocation(false)
        } catch {
          // Fallback to coordinates if reverse geocoding fails
          const lat = position.coords.latitude.toFixed(4)
          const lon = position.coords.longitude.toFixed(4)
          setLocation(`${lat}, ${lon}`)
          setIsGettingLocation(false)
        }
      },
      (error) => {
        setIsGettingLocation(false)
        
        // Handle different error types
        let errorMessage = 'Unable to get your location. Please enter it manually.'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions in your browser settings or enter your location manually.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please enter your location manually.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again or enter your location manually.'
            break
          default:
            errorMessage = 'Unable to get your location. Please enter it manually.'
            break
        }
        
        // Only show alert for permission denied, silently handle others
        if (error.code === error.PERMISSION_DENIED) {
          alert(errorMessage)
        }
        // Don't log to console to avoid cluttering - errors are handled gracefully
      },
      options
    )
  }

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

  const handleSearch = () => {
    onSearch(searchQuery, category, location)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handlePopularSearch = (term: string, cat?: string) => {
    setSearchQuery(term)
    if (cat) setCategory(cat)
    // Trigger search after a short delay
    setTimeout(() => {
      onSearch(term, cat || '', location)
    }, 100)
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Minimal Header - Industry Standard */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-8 leading-tight">
        Find Your Perfect Professional
      </h1>

      {/* Minimal Search Container - Single Row Layout (Airbnb/Zillow Pattern) */}
      <div className="bg-white rounded-xl shadow-xl border-2 border-gray-200 p-4 sm:p-6">
        {/* Search Inputs Row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search for professionals, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-12 h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg"
            />
          </div>

          {/* Location Input */}
          <div className="relative sm:w-56">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <Input
              ref={locationInputRef}
              placeholder="Location"
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => location.length > 0 && setShowSuggestions(true)}
              className="pl-12 pr-12 h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg"
            />
            {/* Use My Location Button */}
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

          {/* Category Select */}
          <div className="relative sm:w-56">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger 
                className="w-full text-base border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg py-1 px-3"
                style={{ height: '3rem', minHeight: '3rem' }}
              >
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="doctor">Doctors</SelectItem>
                <SelectItem value="plumber">Plumbers</SelectItem>
                <SelectItem value="electrician">Electricians</SelectItem>
                <SelectItem value="engineer">Engineers</SelectItem>
                <SelectItem value="designer">Designers</SelectItem>
                <SelectItem value="consultant">Consultants</SelectItem>
                <SelectItem value="therapist">Therapists</SelectItem>
                <SelectItem value="lawyer">Lawyers</SelectItem>
                <SelectItem value="accountant">Accountants</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Big Search Button - Full Width on Next Line */}
        <Button 
          onClick={handleSearch}
          className="w-full h-14 sm:h-16 text-lg sm:text-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <Search className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
          Search
        </Button>

        {/* Popular Searches - Minimal Chips */}
        <div className="flex flex-wrap justify-center gap-2 pt-4 mt-4 border-t border-gray-100">
          {popularSearches.map((item) => (
            <button
              key={item.term}
              type="button"
              onClick={() => handlePopularSearch(item.term, item.category)}
              className="px-4 py-2 text-sm text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              {item.term}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
