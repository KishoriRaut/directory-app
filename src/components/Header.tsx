'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Star,
  Shield,
  Settings,
  Users,
  Briefcase,
  Building,
  ArrowRight,
  LayoutGrid
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface HeaderProps {
  user: any
  onSignOut: () => void
}

export function Header({ user, onSignOut }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle scroll effect
  useEffect(() => {
    if (!mounted) return
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    // Check initial scroll position
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mounted])

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isMobileMenuOpen) {
      return () => {} // Always return a cleanup function
    }
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      
      // Don't close if clicking on mobile menu trigger or inside mobile menu
      if (target.closest('.mobile-menu-trigger') || target.closest('.mobile-menu')) {
        return
      }
      
      // Close mobile menu if clicking outside
      setIsMobileMenuOpen(false)
    }
    
    // Add listener with a small delay to avoid immediate closure on button click
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true)
    }, 100)
    
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [isMobileMenuOpen])

  // Handle Escape key for both menus
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false)
        setIsMobileMenuOpen(false)
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])
  
  // Handle dropdown click outside
  useEffect(() => {
    if (!isDropdownOpen) {
      return () => {} // Always return a cleanup function
    }
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      
      // Don't close if clicking on dropdown trigger or inside dropdown menu
      if (target.closest('.dropdown-trigger') || target.closest('.dropdown-menu')) {
        return
      }
      
      // Close dropdown if clicking outside
      setIsDropdownOpen(false)
    }
    
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true)
    }, 100)
    
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [isDropdownOpen])

  return (
    <>
      {/* Main Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 bg-white ${
        mounted && isScrolled ? 'shadow-md' : ''
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-5">
          {/* Main Navigation */}
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            {/* Brand Name */}
            <Link href="/" className="flex items-center py-0 flex-shrink-0">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-none m-0">
                Siscora Pro
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-10 xl:gap-12 flex-1 justify-center">
              <Link
                key="categories-nav"
                href="/#categories"
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors group px-2"
              >
                <LayoutGrid className="h-4 w-4 group-hover:text-indigo-600" aria-hidden="true" />
                <span className="group-hover:text-indigo-600">Categories</span>
              </Link>
              <Link
                key="how-it-works-nav"
                href="/how-it-works"
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors group px-2"
              >
                <Shield className="h-4 w-4 group-hover:text-indigo-600" aria-hidden="true" />
                <span className="group-hover:text-indigo-600">How It Works</span>
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-5 flex-shrink-0">
              {user ? (
                <>
                  {/* Add Profile CTA - Only show when logged in */}
                  <Link href="/add-profile">
                    <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm hover:shadow-md transition-all px-4">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Add Your Profile
                    </Button>
                  </Link>
                  
                  {/* User Dropdown */}
                  <div className="relative dropdown-menu">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsDropdownOpen(!isDropdownOpen)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setIsDropdownOpen(!isDropdownOpen)
                        }
                      }}
                      className="dropdown-trigger flex items-center gap-2.5 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      aria-label="User menu"
                      aria-expanded={mounted ? isDropdownOpen : false}
                      aria-haspopup="true"
                      title="User menu"
                    >
                      <div className="w-9 h-9 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div 
                        className="dropdown-menu absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                        role="menu"
                        aria-label="User menu"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {user.email?.split('@')[0]}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <Link
                          href="/profile"
                          onClick={() => setIsDropdownOpen(false)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setIsDropdownOpen(false)
                            }
                          }}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
                          role="menuitem"
                          aria-label="Go to my profile"
                        >
                          <User className="h-4 w-4 text-gray-500" aria-hidden="true" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setIsDropdownOpen(false)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setIsDropdownOpen(false)
                            }
                          }}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
                          role="menuitem"
                          aria-label="Go to settings"
                        >
                          <Settings className="h-4 w-4 text-gray-500" aria-hidden="true" />
                          <span>Settings</span>
                        </Link>
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={onSignOut}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                onSignOut()
                                setIsDropdownOpen(false)
                              }
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors focus:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset"
                            role="menuitem"
                            aria-label="Sign out"
                          >
                            <LogOut className="h-4 w-4" aria-hidden="true" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/add-profile">
                    <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm hover:shadow-md transition-all px-4">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Add Your Profile
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm hover:shadow-md transition-all px-4">
                      Sign Up
                    </Button>
                  </Link>
                  <Link href="/auth/signin">
                    <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all px-4">
                      Log In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsMobileMenuOpen(!isMobileMenuOpen)
              }}
              className="mobile-menu-trigger lg:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Toggle mobile menu"
              aria-expanded={mounted ? isMobileMenuOpen : false}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu lg:hidden border-t border-gray-100 bg-white z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4">
              {/* Mobile Navigation */}
              <nav className="space-y-1">
                <Link
                  key="categories-mobile-nav"
                  href="/#categories"
                  className="mobile-menu flex items-center gap-3 text-gray-700 hover:text-indigo-600 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LayoutGrid className="h-5 w-5" aria-hidden="true" />
                  <span>Categories</span>
                </Link>
                <Link
                  key="how-it-works-mobile-nav"
                  href="/how-it-works"
                  className="mobile-menu flex items-center gap-3 text-gray-700 hover:text-indigo-600 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Shield className="h-5 w-5" aria-hidden="true" />
                  <span>How It Works</span>
                </Link>
              </nav>

              {/* Mobile Actions */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-white">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.email?.split('@')[0]}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Link href="/add-profile" onClick={() => setIsMobileMenuOpen(false)} className="mb-4 block">
                      <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm hover:shadow-md transition-all">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Add Your Profile
                      </Button>
                    </Link>
                    <div className="space-y-1 mb-4">
                      <Link
                        href="/profile"
                        className="mobile-menu flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4 text-gray-500" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="mobile-menu flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 text-gray-500" />
                        <span>Settings</span>
                      </Link>
                    </div>
                    <button
                      onClick={() => {
                        onSignOut()
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors mb-4"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-3 mb-4">
                    <Link href="/add-profile" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm hover:shadow-md transition-all">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Add Your Profile
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm hover:shadow-md transition-all">
                        Sign Up
                      </Button>
                    </Link>
                    <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all">
                        Log In
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
