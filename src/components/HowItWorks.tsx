'use client'

import { Search, MessageCircle, CheckCircle, Star } from 'lucide-react'

const steps = [
  {
    icon: Search,
    title: 'Search & Compare',
    description: 'Browse verified professionals, compare prices, and read reviews from real customers.'
  },
  {
    icon: MessageCircle,
    title: 'Contact & Discuss',
    description: 'Message professionals directly, discuss your project, and get detailed quotes.'
  },
  {
    icon: CheckCircle,
    title: 'Book & Pay Securely',
    description: 'Schedule your service and pay safely through our secure payment system.'
  },
  {
    icon: Star,
    title: 'Review & Rate',
    description: 'Share your experience to help others make informed decisions.'
  }
]

export function HowItWorks() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How Siscora Connect Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get connected with trusted professionals in 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                  <step.icon className="h-8 w-8 text-indigo-600" />
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full">
                    <div className="h-0.5 bg-gray-300 w-full ml-8"></div>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-indigo-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of satisfied customers who found their perfect professional through Siscora Connect
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-colors">
                Find a Professional
              </button>
              <button className="px-8 py-3 bg-white border border-gray-300 hover:bg-gray-50 font-semibold rounded-lg transition-colors">
                Add Your Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
