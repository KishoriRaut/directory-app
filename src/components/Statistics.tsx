'use client'

import { Users, Star, Shield } from 'lucide-react'

const stats = [
  {
    icon: Users,
    value: '25,000+',
    label: 'Verified Professionals'
  },
  {
    icon: Star,
    value: '4.8/5',
    label: 'Average Rating'
  },
  {
    icon: Shield,
    value: '100%',
    label: 'Free to Use'
  }
]

export function Statistics() {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <stat.icon className="h-7 w-7 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {stat.value}
              </div>
              <h3 className="text-base md:text-lg font-medium text-indigo-100">
                {stat.label}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
