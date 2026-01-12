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
  Calculator 
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
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Browse by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find the perfect professional for your needs from our verified categories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <category.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                  <p className="text-sm font-medium text-indigo-600">
                    {category.count} professionals
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="#categories">
            <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
              View All Categories
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
