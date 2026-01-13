'use client'

import Link from 'next/link'
import { 
  Stethoscope, 
  Wrench, 
  Zap, 
  HardHat, 
  Palette, 
  Briefcase, 
  Heart, 
  Scale, 
  Calculator,
  Sparkles
} from 'lucide-react'

const categories = [
  {
    name: 'Doctors',
    icon: Stethoscope,
    description: 'Medical professionals',
    count: '2,847',
    href: '#doctors'
  },
  {
    name: 'Plumbers',
    icon: Wrench,
    description: 'Pipe & drainage experts',
    count: '1,523',
    href: '#plumbers'
  },
  {
    name: 'Electricians',
    icon: Zap,
    description: 'Electrical services',
    count: '1,892',
    href: '#electricians'
  },
  {
    name: 'Engineers',
    icon: HardHat,
    description: 'Engineering solutions',
    count: '987',
    href: '#engineers'
  },
  {
    name: 'Maids & Cleaners',
    icon: Sparkles,
    description: 'Cleaning & home services',
    count: '2,156',
    href: '/?category=maid'
  },
  {
    name: 'Designers',
    icon: Palette,
    description: 'Creative professionals',
    count: '1,234',
    href: '#designers'
  },
  {
    name: 'Consultants',
    icon: Briefcase,
    description: 'Business consulting',
    count: '756',
    href: '#consultants'
  },
  {
    name: 'Therapists',
    icon: Heart,
    description: 'Mental health experts',
    count: '432',
    href: '#therapists'
  },
  {
    name: 'Lawyers',
    icon: Scale,
    description: 'Legal services',
    count: '621',
    href: '#lawyers'
  },
  {
    name: 'Accountants',
    icon: Calculator,
    description: 'Financial experts',
    count: '543',
    href: '#accountants'
  }
]

export function PopularCategories() {
  // Show top 6 categories for cleaner layout
  const topCategories = categories.slice(0, 6)
  
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Browse by Category
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
            Find trusted professionals in your area
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
          {topCategories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group text-center"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-200 transition-colors">
                <category.icon className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
