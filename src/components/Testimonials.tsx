'use client'

import { Star } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: 'Jennifer Martinez',
    location: 'San Diego, CA',
    service: 'Plumbing Services',
    professional: 'Michael Chen',
    rating: 5,
    text: 'Found Michael through Siscora Connect and he was amazing! Fixed our plumbing issue the same day. The platform made it so easy to compare quotes and read reviews.',
    date: '2 weeks ago'
  },
  {
    id: 2,
    name: 'Robert Thompson',
    location: 'Austin, TX',
    service: 'Web Design',
    professional: 'Emily Rodriguez',
    rating: 5,
    text: 'Emily exceeded our expectations! The design she created was exactly what we wanted. Being able to message her directly through the platform made communication seamless.',
    date: '1 month ago'
  },
  {
    id: 3,
    name: 'Lisa Anderson',
    location: 'Seattle, WA',
    service: 'Electrical Work',
    professional: 'James Wilson',
    rating: 4,
    text: 'James was professional and knowledgeable. The electrical work was done correctly and on time. The booking process through Siscora Connect was straightforward.',
    date: '3 weeks ago'
  },
  {
    id: 4,
    name: 'David Kim',
    location: 'Boston, MA',
    service: 'Medical Consultation',
    professional: 'Dr. Sarah Johnson',
    rating: 5,
    text: 'Dr. Johnson provided excellent care. The platform made it easy to find a specialist and book an appointment. Highly recommend both the doctor and the service!',
    date: '2 months ago'
  },
  {
    id: 5,
    name: 'Maria Garcia',
    location: 'Phoenix, AZ',
    service: 'Business Consulting',
    professional: 'Alex Turner',
    rating: 5,
    text: 'The consulting services helped our business grow significantly. Siscora Connect made it simple to find qualified professionals and compare their expertise.',
    date: '1 month ago'
  },
  {
    id: 6,
    name: 'John Williams',
    location: 'Denver, CO',
    service: 'Accounting Services',
    professional: 'Rachel Green',
    rating: 4,
    text: 'Rachel handled our tax preparation perfectly. The secure payment system gave us peace of mind. Great experience overall!',
    date: '3 weeks ago'
  }
]

export function Testimonials() {
  // Show top 3 testimonials for cleaner layout
  const topTestimonials = testimonials.slice(0, 3)
  
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50/30 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Testimonials
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {topTestimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                {testimonial.text}
              </p>

              <div className="border-t border-gray-200 pt-4">
                <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                <p className="text-xs text-gray-500">{testimonial.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
