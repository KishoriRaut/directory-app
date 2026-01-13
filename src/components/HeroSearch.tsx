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
  { term: 'Doctors', icon: '👨‍⚕️', category: 'doctor' },
  { term: 'Engineers', icon: '👷', category: 'engineer' },
  { term: 'Designers', icon: '🎨', category: 'designer' },
  { term: 'Lawyers', icon: '⚖️', category: 'lawyer' }
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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        {/* Simplified Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Khojix
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Find Trusted Professionals Near You
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with verified experts in your area
          </p>
        </div>
        
        {/* Single Trust Indicator - Simplified */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-gray-600">25,000+ Verified Professionals</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-5">
          {/* Service Search */}
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <Input
              placeholder="What service do you need?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 h-10 sm:h-12 text-sm sm:text-lg border-gray-300 focus:border-indigo-500"
            />
          </div>

          {/* Category Select */}
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-lg border-gray-300 focus:border-indigo-500">
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

          {/* Location Input with Autocomplete */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 z-10" />
            <Input
              ref={locationInputRef}
              placeholder="City or ZIP code"
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => location.length > 0 && setShowSuggestions(true)}
              className="pl-10 pr-24 h-10 sm:h-12 text-sm sm:text-lg border-gray-300 focus:border-indigo-500"
            />
            {/* Use My Location Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleUseMyLocation}
              disabled={isGettingLocation}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-2 sm:px-3 text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              title="Use my current location"
            >
              {isGettingLocation ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <Navigation className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
              <span className="hidden sm:inline ml-1">Near me</span>
            </Button>
            
            {/* Location Autocomplete Suggestions */}
            {showSuggestions && locationSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
              >
                {locationSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleLocationSelect(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button 
            onClick={handleSearch}
            className="w-full sm:flex-1 px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Search className="h-5 w-5 mr-2" />
            Search Professionals
          </Button>
          
          {/* Secondary CTA - Moved here, less prominent */}
          <Link href="/add-profile" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 text-sm sm:text-base">
              <Briefcase className="h-4 w-4 mr-2" />
              For Professionals
            </Button>
          </Link>
        </div>

        {/* Simplified Popular Searches */}
        <div className="mt-5 text-center">
          <p className="text-xs text-gray-500 mb-2">Popular:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularSearches.slice(0, 4).map((item) => (
              <button
                key={item.term}
                type="button"
                onClick={() => handlePopularSearch(item.term, item.category)}
                className="px-3 py-1.5 text-xs sm:text-sm bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg text-gray-700 hover:text-indigo-700 transition-colors"
              >
                {item.term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
