'use client'

import { useState, useEffect } from 'react'
import { Users, Star, Shield } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export function Statistics() {
  const [totalProfessionals, setTotalProfessionals] = useState<number>(0)
  const [verifiedCount, setVerifiedCount] = useState<number>(0)
  const [averageRating, setAverageRating] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false)
        return
      }

      try {
        // Fetch total count of professionals
        const { count: totalCount } = await supabase
          .from('professionals')
          .select('*', { count: 'exact', head: true })

        // Fetch verified professionals count
        const { count: verifiedProfessionalsCount } = await supabase
          .from('professionals')
          .select('*', { count: 'exact', head: true })
          .eq('verified', true)

        // Fetch average rating
        const { data: ratingData } = await supabase
          .from('professionals')
          .select('rating')
          .not('rating', 'is', null)
          .gt('rating', 0)

        if (totalCount !== null) {
          setTotalProfessionals(totalCount)
        }

        if (verifiedProfessionalsCount !== null) {
          setVerifiedCount(verifiedProfessionalsCount)
        }

        // Calculate average rating
        if (ratingData && ratingData.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sum = (ratingData as any[]).reduce((acc: number, prof: any) => acc + (Number(prof.rating) || 0), 0)
          const avg = sum / ratingData.length
          setAverageRating(Math.round(avg * 10) / 10) // Round to 1 decimal place
        }
      } catch (error) {
        console.error('Error fetching statistics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K+`
    }
    return `${count}+`
  }

  const stats = [
    {
      icon: Users,
      value: loading ? '...' : formatCount(verifiedCount || totalProfessionals),
      label: verifiedCount > 0 ? 'Verified' : 'Professionals'
    },
    {
      icon: Star,
      value: loading ? '...' : averageRating > 0 ? `${averageRating}/5` : 'N/A',
      label: 'Rating'
    },
    {
      icon: Shield,
      value: '100%',
      label: 'Free'
    }
  ]

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <stat.icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" aria-hidden="true" />
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                {stat.value}
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-medium text-indigo-100">
                {stat.label}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
