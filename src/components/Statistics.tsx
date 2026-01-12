'use client'

import { Users, MapPin, Star, Shield, Briefcase, MessageCircle } from 'lucide-react'

const stats = [
  {
    icon: Users,
    value: '25,000+',
    label: 'Verified Professionals',
    description: 'Background-checked experts across all categories'
  },
  {
    icon: MapPin,
    value: '500+',
    label: 'Cities Covered',
    description: 'Nationwide coverage with local experts'
  },
  {
    icon: Star,
    value: '4.8/5',
    label: 'Average Rating',
    description: 'Based on 50,000+ customer reviews'
  },
  {
    icon: Shield,
    value: '100%',
    label: 'Verified Profiles',
    description: 'All professionals are background checked'
  },
  {
    icon: Briefcase,
    value: '15+',
    label: 'Categories',
    description: 'Comprehensive service categories'
  },
  {
    icon: MessageCircle,
    value: '1M+',
    label: 'Messages Sent',
    description: 'Direct communication between users and pros'
  }
]

export function Statistics() {
  return (
    <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Millions
          </h2>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            Join the growing community of customers and professionals who trust Siscora Connect
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {stat.value}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {stat.label}
              </h3>
              <p className="text-indigo-100 text-sm">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Growing Every Day
            </h3>
            <p className="text-indigo-100 mb-6">
              We're constantly expanding our network of trusted professionals to serve you better
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold mb-1">500+</div>
                <p className="text-indigo-100 text-sm">New Professionals Weekly</p>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">10,000+</div>
                <p className="text-indigo-100 text-sm">Monthly Active Users</p>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">98%</div>
                <p className="text-indigo-100 text-sm">Customer Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
