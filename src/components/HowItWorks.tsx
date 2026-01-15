'use client'

import { Search, MessageCircle, CheckCircle, Star } from 'lucide-react'

const steps = [
  {
    icon: Search,
    title: 'Search',
    description: 'Find professionals'
  },
  {
    icon: MessageCircle,
    title: 'Contact',
    description: 'Message directly'
  },
  {
    icon: CheckCircle,
    title: 'Book',
    description: 'Schedule service'
  },
  {
    icon: Star,
    title: 'Review',
    description: 'Rate experience'
  }
]

export function HowItWorks() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-indigo-50/40 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.title} className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <step.icon className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600" aria-hidden="true" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
                {step.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
