'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  MessageCircle, 
  CheckCircle, 
  Star, 
  Shield, 
  Users,
  Clock,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Check,
  User as UserIcon
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const steps = [
  {
    icon: Search,
    title: 'Search',
    description: 'Find professionals by category, location, and needs.',
    details: [
      'Search by service type',
      'Filter by location',
      'Compare profiles',
      'Read reviews'
    ],
    forCustomer: true
  },
  {
    icon: Shield,
    title: 'Verified',
    description: 'All professionals are background-checked and verified.',
    details: [
      'Background checks',
      'License verification',
      'Insurance validation',
      'Identity screening'
    ],
    forCustomer: true
  },
  {
    icon: MessageCircle,
    title: 'Contact',
    description: 'Message directly and get quotes.',
    details: [
      'Secure messaging',
      'Get quotes',
      'Compare pricing',
      'Book service'
    ],
    forCustomer: true
  },
  {
    icon: Star,
    title: 'Review',
    description: 'Complete service and share your experience.',
    details: [
      'Service completed',
      'Payment processed',
      'Rate experience',
      'Help others'
    ],
    forCustomer: true
  }
]

const providerSteps = [
  {
    icon: UserIcon,
    title: 'Create Profile',
    description: 'Build your professional profile with skills and experience.',
    details: [
      'Complete in 10 minutes',
      'Add skills and photos',
      'Set availability',
      'Set rates'
    ]
  },
  {
    icon: Shield,
    title: 'Get Verified',
    description: 'Complete verification to build trust.',
    details: [
      'Background check',
      'Upload licenses',
      'Insurance docs',
      'Get verified badge'
    ]
  },
  {
    icon: Search,
    title: 'Get Matches',
    description: 'Receive job matches and send quotes.',
    details: [
      'AI job matching',
      'Qualified leads',
      'Send quotes',
      'Track success'
    ]
  },
  {
    icon: CheckCircle,
    title: 'Get Paid',
    description: 'Complete jobs and build reputation.',
    details: [
      'Secure payments',
      'Build reviews',
      'Repeat customers',
      'Grow business'
    ]
  }
]

// Stats will be fetched dynamically

const trustSignals = [
  {
    icon: Shield,
    title: 'Background Checked',
    description: 'All professionals verified'
  },
  {
    icon: CheckCircle,
    title: 'Licensed & Insured',
    description: 'Verified credentials'
  },
  {
    icon: Star,
    title: 'Real Reviews',
    description: 'Authentic customer feedback'
  },
  {
    icon: Users,
    title: 'Vetted',
    description: 'Quality screening process'
  }
]

const features = [
  {
    icon: Shield,
    title: 'Verified',
    description: 'Background-checked professionals'
  },
  {
    icon: Users,
    title: 'Large Network',
    description: 'Thousands of professionals'
  },
  {
    icon: Clock,
    title: 'Quick Response',
    description: '24-hour response time'
  },
  {
    icon: MapPin,
    title: 'Local',
    description: 'Find nearby professionals'
  }
]

const pricingInfo = {
  forCustomers: {
    title: 'Free for Customers',
    description: 'Search and book free. Pay only for services.',
    features: [
      'Free search',
      'No booking fees',
      'Secure payments',
      'Satisfaction guarantee'
    ]
  },
  forProfessionals: {
    title: 'Simple Pricing',
    description: 'Pay per lead. No monthly fees.',
    features: [
      'Free profile',
      'Pay per lead',
      'No subscriptions',
      'Cancel anytime'
    ]
  }
}

const faqs = [
  {
    question: 'How do I know if a professional is trustworthy?',
    answer: 'All professionals are verified through background checks, license verification, and insurance validation. Read authentic reviews from verified customers.'
  },
  {
    question: 'Is it really free for customers?',
    answer: 'Yes, search and contact professionals free. Pay only for services received. No booking fees.'
  },
  {
    question: 'How does the matching algorithm work?',
    answer: 'Our algorithm analyzes location, service needs, budget, availability, skills, and reviews to match you with suitable professionals.'
  },
  {
    question: 'What if I\'m not satisfied with the service?',
    answer: 'Contact support within 7 days. We\'ll help resolve issues or provide a refund if needed.'
  },
  {
    question: 'How do professionals get paid?',
    answer: 'Payments are held in escrow until service completion. Once approved, payment is released to the professional.'
  },
  {
    question: 'Can I cancel a booking?',
    answer: 'Yes, according to the professional\'s policy. Most offer free cancellation up to 24 hours before service.'
  },
  {
    question: 'Is there a mobile app available?',
    answer: 'Currently, we offer a fully responsive web app that works seamlessly on all mobile devices. A native mobile app is coming soon.'
  }
]

export default function HowItWorksPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [stats, setStats] = useState([
    { number: '...', label: 'Verified Professionals' },
    { number: '...', label: 'Average Rating' },
    { number: '...', label: 'Total Professionals' },
    { number: '100%', label: 'Free' }
  ])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          // Handle refresh token errors
          if (error.message?.includes('Refresh Token') || error.message?.includes('refresh_token')) {
            await supabase.auth.signOut()
            setUser(null)
            return
          }
        }
        setUser(session?.user || null)
      } catch (error: unknown) {
        // Handle any unexpected errors
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('Refresh Token') || errorMessage.includes('refresh_token')) {
          await supabase.auth.signOut()
        }
        setUser(null)
      }
    }
    
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch real statistics from database
  useEffect(() => {
    const fetchStats = async () => {
      if (!isSupabaseConfigured()) {
        return
      }

      try {
        // Fetch total professionals
        const { count: totalCount } = await supabase
          .from('professionals')
          .select('*', { count: 'exact', head: true })

        // Fetch verified professionals
        const { count: verifiedCount } = await supabase
          .from('professionals')
          .select('*', { count: 'exact', head: true })
          .eq('verified', true)

        // Fetch average rating
        const { data: ratingData } = await supabase
          .from('professionals')
          .select('rating')
          .not('rating', 'is', null)
          .gt('rating', 0)

        // Calculate average rating
        let avgRating = 0
        if (ratingData && ratingData.length > 0) {
          const sum = ratingData.reduce((acc: number, prof: { rating: number }) => acc + (Number(prof.rating) || 0), 0)
          avgRating = Math.round((sum / ratingData.length) * 10) / 10
        }

        // Format count helper
        const formatCount = (count: number | null) => {
          if (!count || count === 0) return '0+'
          if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K+`
          }
          return `${count}+`
        }

        setStats([
          { 
            number: formatCount(verifiedCount), 
            label: 'Verified Professionals' 
          },
          { 
            number: avgRating > 0 ? `${avgRating}/5` : 'N/A', 
            label: 'Average Rating' 
          },
          { 
            number: formatCount(totalCount), 
            label: 'Total Professionals' 
          },
          { 
            number: '100%', 
            label: 'Free' 
          }
        ])
      } catch (error) {
        console.error('Error fetching statistics:', error)
      }
    }

    fetchStats()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <Header user={user} onSignOut={handleSignOut} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Siscora Pro
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 font-semibold mb-1">Professional Service Directory</p>
              <p className="text-xs text-gray-500">by Siscora.com</p>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              How It Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">
              Connect with professionals in 4 steps
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/#results-section">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-6 sm:px-8 py-3">
                  <Search className="h-4 w-4 mr-2" />
                  Find a Professional
                </Button>
              </Link>
              <Link href="/add-profile">
                <Button variant="outline" className="border-gray-300 hover:bg-gray-50 px-6 sm:px-8 py-3">
                  Add Your Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Millions
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-white/80 text-lg">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Trust Siscora Pro?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We go above and beyond to ensure your safety and satisfaction
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustSignals.map((signal, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <signal.icon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {signal.title}
                </h3>
                <p className="text-gray-600">
                  {signal.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Steps Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Started
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="text-center mb-6">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                      <step.icon className="h-10 w-10 text-indigo-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-10 left-full w-full">
                        <div className="h-0.5 bg-gray-300 w-full ml-10"></div>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {step.description}
                  </p>
                </div>
                <ul className="space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Provider Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              For Professionals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {providerSteps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="text-center mb-6">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <step.icon className="h-10 w-10 text-purple-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    {index < providerSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-10 left-full w-full">
                        <div className="h-0.5 bg-gray-300 w-full ml-10"></div>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {step.description}
                  </p>
                </div>
                <ul className="space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pricing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-200 shadow-md">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {pricingInfo.forCustomers.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {pricingInfo.forCustomers.description}
                </p>
              </div>
              <ul className="space-y-3">
                {pricingInfo.forCustomers.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200 shadow-md">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {pricingInfo.forProfessionals.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {pricingInfo.forProfessionals.description}
                </p>
              </div>
              <ul className="space-y-3">
                {pricingInfo.forProfessionals.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              FAQ
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <span className="font-bold text-gray-900">{faq.question}</span>
                    <ArrowRight className={`h-5 w-5 text-gray-500 transition-transform ${
                      expandedFaq === index ? 'rotate-90' : ''
                    }`} />
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#results-section">
                <Button className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3">
                  <Search className="h-4 w-4 mr-2" />
                  Find a Professional
                </Button>
              </Link>
              <Link href="/add-profile">
                <Button className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-3 font-bold">
                  Add Your Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Support
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600">1-800-PROS</p>
              <p className="text-sm text-gray-500">Mon-Fri, 9AM-6PM EST</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600">support@siscora.com</p>
              <p className="text-sm text-gray-500">Response within 24 hours</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600">Available on website</p>
              <p className="text-sm text-gray-500">Mon-Fri, 9AM-6PM EST</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
