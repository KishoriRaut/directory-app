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
  Sparkles,
  MoreHorizontal
} from 'lucide-react'

const categories = [
  {
    name: 'Doctors',
    icon: Stethoscope,
    description: 'Medical professionals',
    count: '2,847',
    href: '/?category=doctor',
    category: 'doctor'
  },
  {
    name: 'Plumbers',
    icon: Wrench,
    description: 'Pipe & drainage experts',
    count: '1,523',
    href: '/?category=plumber',
    category: 'plumber'
  },
  {
    name: 'Electricians',
    icon: Zap,
    description: 'Electrical services',
    count: '1,892',
    href: '/?category=electrician',
    category: 'electrician'
  },
  {
    name: 'Engineers',
    icon: HardHat,
    description: 'Engineering solutions',
    count: '987',
    href: '/?category=engineer',
    category: 'engineer'
  },
  {
    name: 'Maids & Cleaners',
    icon: Sparkles,
    description: 'Cleaning & home services',
    count: '2,156',
    href: '/?category=maid',
    category: 'maid'
  },
  {
    name: 'Designers',
    icon: Palette,
    description: 'Creative professionals',
    count: '1,234',
    href: '/?category=designer',
    category: 'designer'
  },
  {
    name: 'Consultants',
    icon: Briefcase,
    description: 'Business consulting',
    count: '756',
    href: '/?category=consultant',
    category: 'consultant'
  },
  {
    name: 'Therapists',
    icon: Heart,
    description: 'Mental health experts',
    count: '432',
    href: '/?category=therapist',
    category: 'therapist'
  },
  {
    name: 'Lawyers',
    icon: Scale,
    description: 'Legal services',
    count: '621',
    href: '/?category=lawyer',
    category: 'lawyer'
  },
  {
    name: 'Accountants',
    icon: Calculator,
    description: 'Financial experts',
    count: '543',
    href: '/?category=accountant',
    category: 'accountant'
  },
  {
    name: 'Other',
    icon: MoreHorizontal,
    description: 'Other professionals',
    count: '1,200',
    href: '/?category=other',
    category: 'other'
  }
]

export function PopularCategories() {
  // Show all categories
  return (
    <section id="categories" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Categories
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 max-w-7xl mx-auto">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/?category=${category.category}`}
              className="bg-white rounded-lg p-3 sm:p-4 md:p-5 border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 group text-center touch-target shadow-sm min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center"
              aria-label={`Browse ${category.name} professionals`}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:bg-indigo-100 transition-colors">
                <category.icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-indigo-600" aria-hidden="true" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
