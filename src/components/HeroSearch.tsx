'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin, Briefcase } from 'lucide-react'

interface HeroSearchProps {
  onSearch: (query: string, category: string, location: string) => void
}

export function HeroSearch({ onSearch }: HeroSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')

  const handleSearch = () => {
    onSearch(searchQuery, category, location)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
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
        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8">
          Connect with verified experts in your area. Get quotes, read reviews, and hire with confidence.
        </p>
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

          {/* Location Input */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <Input
              placeholder="City or ZIP code"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 h-10 sm:h-12 text-sm sm:text-lg border-gray-300 focus:border-indigo-500"
            />
          </div>
        </div>

        <Button 
          onClick={handleSearch}
          className="w-full md:w-auto px-6 sm:px-8 py-3 text-sm sm:text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Search Professionals
        </Button>

        {/* Popular Searches */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">Popular searches:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Plumbers', 'Electricians', 'Doctors', 'Web Designers'].map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
