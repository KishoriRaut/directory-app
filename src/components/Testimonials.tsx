'use client'

import { Star, Quote } from 'lucide-react'

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
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real reviews from real customers who found trusted professionals through Siscora Connect
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-gray-50 rounded-xl p-6">
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

              <div className="relative mb-4">
                <Quote className="absolute -top-2 -left-2 h-8 w-8 text-indigo-200" />
                <p className="text-gray-700 leading-relaxed pl-6">
                  {testimonial.text}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{testimonial.service}</p>
                    <p className="text-xs text-gray-500">{testimonial.date}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-indigo-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-indigo-600 mb-2">50,000+</div>
                <p className="text-gray-600">Happy Customers</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-600 mb-2">4.8/5</div>
                <p className="text-gray-600">Average Rating</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-600 mb-2">10,000+</div>
                <p className="text-gray-600">Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
