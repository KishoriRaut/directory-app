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
  Search, 
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Star,
  Shield,
  Users,
  Briefcase,
  Building,
  ArrowRight
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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.dropdown-menu') && !target.closest('.dropdown-trigger')) {
        setIsDropdownOpen(false)
      }
      if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-trigger')) {
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const navigationItems = [
    { name: 'Browse', href: '/#results-section', icon: Search },
    { name: 'Categories', href: '/#categories', icon: Briefcase },
    { name: 'How It Works', href: '/how-it-works', icon: Shield },
  ]

  const dropdownItems = [
    { name: 'My Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Shield },
  ]

  return (
    <>
      {/* Main Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md' 
          : 'bg-white'
      }`}>
        <div className="container mx-auto px-4">
          {/* Main Navigation */}
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg flex-shrink-0">
                <span className="text-white font-bold text-lg sm:text-xl leading-none select-none">K</span>
              </div>
              <div className="h-8 sm:h-10 flex items-center">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-none m-0">
                  Khojix
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors group"
                >
                  <item.icon className="h-4 w-4 group-hover:text-indigo-600" />
                  <span className="group-hover:text-indigo-600">{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <>
                  {/* For Professionals CTA - Only show when logged in */}
                  <Link href="/add-profile">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                      <Briefcase className="h-4 w-4 mr-2" />
                      For Professionals
                    </Button>
                  </Link>
                  
                  {/* User Dropdown */}
                  <div className="relative dropdown-menu">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsDropdownOpen(!isDropdownOpen)
                      }}
                      className="dropdown-trigger flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-9 h-9 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-white">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="dropdown-menu absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {user.email?.split('@')[0]}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        {dropdownItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <item.icon className="h-4 w-4 text-gray-500" />
                            <span>{item.name}</span>
                          </Link>
                        ))}
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={onSignOut}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      Sign Up
                    </Button>
                  </Link>
                  <Link href="/add-profile">
                    <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                      <Briefcase className="h-4 w-4 mr-2" />
                      For Professionals
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-menu-trigger lg:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
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
          <div className="mobile-menu lg:hidden border-t border-gray-100 bg-white">
            <div className="container mx-auto px-4 py-4">
              {/* Mobile Navigation */}
              <nav className="space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="mobile-menu flex items-center gap-3 text-gray-700 hover:text-indigo-600 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
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
                      <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                        <Briefcase className="h-4 w-4 mr-2" />
                        For Professionals
                      </Button>
                    </Link>
                    <div className="space-y-1 mb-4">
                      {dropdownItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="mobile-menu flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <item.icon className="h-4 w-4 text-gray-500" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
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
                    <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                        Log In
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                        Sign Up
                      </Button>
                    </Link>
                    <Link href="/add-profile" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                        <Briefcase className="h-4 w-4 mr-2" />
                        For Professionals
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
