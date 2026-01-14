'use client'

import { Search, MessageCircle, CheckCircle, Star } from 'lucide-react'

const steps = [
  {
    icon: Search,
    title: 'Search',
    description: 'Find verified professionals'
  },
  {
    icon: MessageCircle,
    title: 'Contact',
    description: 'Discuss your project'
  },
  {
    icon: CheckCircle,
    title: 'Book',
    description: 'Schedule securely'
  },
  {
    icon: Star,
    title: 'Review',
    description: 'Share your experience'
  }
]

export function HowItWorks() {
  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((step) => (
            <div key={step.title} className="text-center">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <step.icon className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
