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
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const steps = [
  {
    icon: Search,
    title: 'Search & Get Matched',
    description: 'Our AI-powered algorithm matches you with the best professionals based on your specific needs, location, and budget.',
    details: [
      'Describe your service needs in 2 minutes',
      'AI matching considers 50+ data points',
      'Get matched with 3-5 pre-vetted pros',
      'Compare profiles, reviews, and pricing'
    ],
    forCustomer: true
  },
  {
    icon: Shield,
    title: 'Verified Professionals',
    description: 'Every professional undergoes rigorous background checks, license verification, and insurance validation.',
    details: [
      'Background checks for all providers',
      'License and certification verification',
      'Insurance coverage validation',
      'Identity verification and screening'
    ],
    forCustomer: true
  },
  {
    icon: MessageCircle,
    title: 'Connect & Book',
    description: 'Message professionals directly, discuss your project, get quotes, and book with confidence.',
    details: [
      'Secure in-app messaging',
      'Receive detailed quotes within 24hrs',
      'Compare pricing and availability',
      'Book and pay securely through platform'
    ],
    forCustomer: true
  },
  {
    icon: Star,
    title: 'Service & Review',
    description: 'Get your service completed and share your experience to help the community.',
    details: [
      'Professional completes the service',
      'Payment released after completion',
      'Rate and review your experience',
      'Build trust in the community'
    ],
    forCustomer: true
  }
]

const providerSteps = [
  {
    icon: UserIcon,
    title: 'Create Your Profile',
    description: 'Build your professional profile with skills, experience, photos, and customer reviews.',
    details: [
      'Complete profile in 10 minutes',
      'Showcase your skills and experience',
      'Add photos of completed work',
      'Set your availability and rates'
    ]
  },
  {
    icon: Shield,
    title: 'Get Verified',
    description: 'Complete our verification process to build trust and get more job opportunities.',
    details: [
      'Background check and identity verification',
      'License and certification upload',
      'Insurance documentation',
      'Receive verification badge'
    ]
  },
  {
    icon: Search,
    title: 'Receive Job Matches',
    description: 'Get matched with relevant jobs in your area and send quotes to interested customers.',
    details: [
      'AI-powered job matching',
      'Receive qualified leads daily',
      'Send custom quotes',
      'Track your success rate'
    ]
  },
  {
    icon: CheckCircle,
    title: 'Get Paid & Grow',
    description: 'Complete jobs, receive secure payments, and build your reputation with reviews.',
    details: [
      'Secure payment processing',
      'Build your review portfolio',
      'Get repeat customers',
      'Grow your business'
    ]
  }
]

const stats = [
  { number: '50,000+', label: 'Verified Professionals' },
  { number: '1M+', label: 'Jobs Completed' },
  { number: '4.8/5', label: 'Average Rating' },
  { number: '500+', label: 'Cities Served' }
]

const trustSignals = [
  {
    icon: Shield,
    title: 'Background Checked',
    description: 'All professionals undergo comprehensive background checks'
  },
  {
    icon: CheckCircle,
    title: 'Licensed & Insured',
    description: 'Verification of licenses and insurance coverage'
  },
  {
    icon: Star,
    title: 'Reviewed by Real Customers',
    description: 'Authentic reviews from verified service completions'
  },
  {
    icon: Users,
    title: 'Vetted Professionals',
    description: 'Rigorous screening process for quality assurance'
  }
]

const features = [
  {
    icon: Shield,
    title: 'Verified Professionals',
    description: 'All professionals are background-checked and verified for your safety.'
  },
  {
    icon: Users,
    title: 'Large Network',
    description: 'Access thousands of trusted professionals across various categories.'
  },
  {
    icon: Clock,
    title: 'Quick Response',
    description: 'Get responses from professionals typically within 24 hours.'
  },
  {
    icon: MapPin,
    title: 'Local Services',
    description: 'Find professionals in your local area for convenient service.'
  }
]

const pricingInfo = {
  forCustomers: {
    title: 'Free for Customers',
    description: 'Search, compare, and book professionals at no cost. Pay only for the services you receive.',
    features: [
      'Free search and browsing',
      'No booking fees',
      'Secure payment processing',
      'Service satisfaction guarantee'
    ]
  },
  forProfessionals: {
    title: 'Simple Pricing for Professionals',
    description: 'Pay only when you get hired. No monthly fees or hidden charges.',
    features: [
      'Free profile creation',
      'Pay per successful lead',
      'No subscription fees',
      'Cancel anytime'
    ]
  }
}

const faqs = [
  {
    question: 'How do I know if a professional is trustworthy?',
    answer: 'All professionals on KhojCity go through a comprehensive verification process including background checks, license verification, insurance validation, and review of their work history. You can also read authentic reviews from verified service completions to make informed decisions.'
  },
  {
    question: 'Is it really free for customers?',
    answer: 'Yes, it\'s completely free to search for professionals, read reviews, and contact them. You only pay for the services you receive. We don\'t charge booking fees or service fees to customers.'
  },
  {
    question: 'How does the matching algorithm work?',
    answer: 'Our AI-powered algorithm analyzes over 50 data points including your location, service requirements, budget, professional availability, skills, reviews, and past success rates to match you with the most suitable professionals for your specific needs.'
  },
  {
    question: 'What if I\'m not satisfied with the service?',
    answer: 'We offer a satisfaction guarantee. If you\'re not satisfied with the service, contact our support team within 7 days of completion. We\'ll help resolve the issue, and if necessary, arrange for rework or provide a refund through our secure payment system.'
  },
  {
    question: 'How do professionals get paid?',
    answer: 'Payments are processed securely through our platform. When you book a service, the payment is held in escrow until the service is completed to your satisfaction. Once you approve the work, the payment is released to the professional minus our service fee.'
  },
  {
    question: 'Can I cancel a booking?',
    answer: 'Yes, you can cancel bookings according to the professional\'s cancellation policy. Most professionals offer free cancellation up to 24 hours before the scheduled service. If you cancel after the deadline, you may be charged a cancellation fee.'
  },
  {
    question: 'Is there a mobile app available?',
    answer: 'Yes! Our mobile app is available for both iOS and Android. You can search for professionals, manage bookings, send messages, and handle payments all from your phone. Download the app for on-the-go access to our entire network.'
  }
]

export default function HowItWorksPage() {
  const [user, setUser] = useState<any>(null)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

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
                KhojCity
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 font-medium mb-1">Professional Directory</p>
              <p className="text-xs text-gray-500">by Siscora.com</p>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              How KhojCity Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">
              Get connected with trusted professionals in 4 simple steps. 
              Our platform makes it easy to find, book, and review services.
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
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join the largest network of verified professionals and satisfied customers
            </p>
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
              Why Trust KhojCity?
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
              4 Simple Steps to Get Started
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our streamlined process makes it easy to connect with the right professional for your needs
            </p>
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
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
              For Service Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Grow your business with our platform designed specifically for service professionals
            </p>
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
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
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              No hidden fees. No surprises. Just honest pricing for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
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

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
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
              Why Choose KhojCity?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We&apos;re committed to making professional services accessible, safe, and reliable
            </p>
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
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Got questions? We&apos;ve got answers. Here are some common questions about using KhojCity.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <span className="font-semibold text-gray-900">{faq.question}</span>
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

      {/* Mobile App Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Take KhojCity Anywhere
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Manage your professional services on the go with our mobile app. Search, book, and pay—all from your pocket.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">Search and book professionals instantly</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">Real-time messaging with professionals</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">Secure mobile payments</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">Push notifications for updates</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-6 py-3 bg-black hover:bg-gray-900 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                    <span className="text-black text-xs font-bold">A</span>
                  </div>
                  Download for Android
                </button>
                <button className="px-6 py-3 bg-black hover:bg-gray-900 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                    <span className="text-black text-xs font-bold">i</span>
                  </div>
                  Download for iOS
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl">
                <div className="bg-gray-900 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-700 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-700 rounded w-4/6"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-indigo-600 rounded-xl p-4 text-center">
                    <Search className="h-6 w-6 text-white mx-auto mb-2" />
                    <div className="text-xs text-white">Search</div>
                  </div>
                  <div className="bg-purple-600 rounded-xl p-4 text-center">
                    <MessageCircle className="h-6 w-6 text-white mx-auto mb-2" />
                    <div className="text-xs text-white">Chat</div>
                  </div>
                  <div className="bg-green-600 rounded-xl p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-white mx-auto mb-2" />
                    <div className="text-xs text-white">Book</div>
                  </div>
                </div>
              </div>
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
            <p className="text-xl text-white/90 mb-8">
              Join thousands of satisfied customers who found their perfect professional through KhojCity
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#results-section">
                <Button className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3">
                  <Search className="h-4 w-4 mr-2" />
                  Find a Professional
                </Button>
              </Link>
              <Link href="/add-profile">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-3">
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
              Need Help? We're Here for You
            </h2>
            <p className="text-gray-600">
              Our support team is available to help you with any questions or concerns
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600">1-800-PROS</p>
              <p className="text-sm text-gray-500">Mon-Fri, 9AM-6PM EST</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600">support@siscora.com</p>
              <p className="text-sm text-gray-500">Response within 24 hours</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600">Available on website</p>
              <p className="text-sm text-gray-500">Mon-Fri, 9AM-6PM EST</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
