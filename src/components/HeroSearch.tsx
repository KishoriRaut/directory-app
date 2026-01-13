'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin, Briefcase, Navigation, Loader2, CheckCircle, Users, Star, Shield, ArrowRight } from 'lucide-react'
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
      alert('Geolocation is not supported by your browser')
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocoding to get city name
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
          )
          const data = await response.json()
          const cityName = data.city || data.locality || `${data.latitude}, ${data.longitude}`
          setLocation(cityName)
          setIsGettingLocation(false)
        } catch (error) {
          // Fallback to coordinates
          setLocation(`${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`)
          setIsGettingLocation(false)
        }
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to get your location. Please enter it manually.')
        setIsGettingLocation(false)
      }
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
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Khojix
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 font-medium mb-1">
            Professional Directory
          </p>
          <p className="text-xs text-gray-500">by Siscora.com</p>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Find Trusted Professionals Near You
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6">
          Connect with verified experts in your area. Get quotes, read reviews, and hire with confidence.
        </p>
        
        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-8">
          <div className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            <span className="font-medium">25,000+ Verified Professionals</span>
          </div>
          <div className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
            <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">4.8/5 Average Rating</span>
          </div>
          <div className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
            <span className="font-medium">100% Free to Use</span>
          </div>
        </div>

        {/* Secondary CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <Link href="/how-it-works">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm sm:text-base">
              How It Works
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="/add-profile">
            <Button variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 text-sm sm:text-base">
              <Briefcase className="h-4 w-4 mr-2" />
              For Professionals
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
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

        <Button 
          onClick={handleSearch}
          className="w-full md:w-auto px-6 sm:px-8 py-3 text-sm sm:text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Search Professionals
        </Button>

        {/* Popular Searches with Icons */}
        <div className="mt-6 text-center">
          <p className="text-sm font-medium text-gray-700 mb-3">Popular searches:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularSearches.map((item) => (
              <button
                key={item.term}
                type="button"
                onClick={() => handlePopularSearch(item.term, item.category)}
                className="px-4 py-2 text-sm bg-gradient-to-r from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-purple-50 border border-gray-200 hover:border-indigo-300 rounded-full text-gray-700 hover:text-indigo-700 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.term}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
