import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/add-profile`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Dynamic professional profile pages
  let professionalPages: MetadataRoute.Sitemap = []
  
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      const { data: professionals } = await supabase
        .from('professionals')
        .select('id, updated_at')
        .limit(10000) // Adjust based on your needs

      if (professionals) {
        professionalPages = professionals.map((prof) => ({
          url: `${baseUrl}/profile/${prof.id}`,
          lastModified: prof.updated_at ? new Date(prof.updated_at) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }))
      }
    } catch (error) {
      console.error('Error fetching professionals for sitemap:', error)
      // Continue with static pages only if there's an error
    }
  }

  return [...staticPages, ...professionalPages]
}
