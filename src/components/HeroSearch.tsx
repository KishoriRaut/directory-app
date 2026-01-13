'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin, Briefcase, Navigation, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

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
        } catch (error) {
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-6 sm:mb-8">
        {/* Minimal Header */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4 leading-tight">
          Find Your Perfect Professional
        </h1>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Service Search */}
          <div className="relative md:col-span-2 lg:col-span-2">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <Input
              placeholder="Search for professionals, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 sm:pl-12 h-12 sm:h-14 text-sm sm:text-base border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg sm:rounded-xl"
            />
          </div>

          {/* Location Input with Autocomplete */}
          <div className="relative">
            <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 z-10" />
            <Input
              ref={locationInputRef}
              placeholder="Location"
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => location.length > 0 && setShowSuggestions(true)}
              className="pl-10 sm:pl-12 pr-16 sm:pr-20 h-12 sm:h-14 text-sm sm:text-base border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg sm:rounded-xl"
            />
            {/* Use My Location Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleUseMyLocation}
              disabled={isGettingLocation}
              className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 h-8 sm:h-9 px-2 sm:px-3 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg touch-target"
              title="Use my current location"
            >
              {isGettingLocation ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <Navigation className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>
            
            {/* Location Autocomplete Suggestions */}
            {showSuggestions && locationSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto"
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
        </div>

        {/* Category Filter Row */}
        <div className="mb-4 sm:mb-6">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-12 sm:h-14 text-sm sm:text-base border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg sm:rounded-xl">
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

        {/* Search Button */}
        <Button 
          onClick={handleSearch}
          className="w-full h-12 sm:h-14 text-sm sm:text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all touch-target"
        >
          <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Search
        </Button>

        {/* Minimal Popular Searches */}
        <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-2">
          {popularSearches.slice(0, 6).map((item) => (
            <button
              key={item.term}
              type="button"
              onClick={() => handlePopularSearch(item.term, item.category)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors touch-target"
            >
              {item.term}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
