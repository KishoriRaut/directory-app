'use client'

// Structured data for SEO - Siscora Pro
import { Professional } from '@/types/directory'

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'LocalBusiness' | 'ItemList'
  data?: any
  professionals?: Professional[]
}

export function StructuredData({ type, data, professionals }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'Organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Siscora Pro",
          "url": process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com",
          "logo": `${process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com"}/vercel.svg`,
          "description": "Professional Service Directory connecting users with trusted professionals in their area",
          "sameAs": [
            // Add your social media links here when available
          ]
        }
      
      case 'WebSite':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Siscora Pro",
          "url": process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com"}/?search={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        }
      
      case 'ItemList':
        if (professionals && professionals.length > 0) {
          return {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": professionals.map((prof, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "LocalBusiness",
                "name": prof.name,
                "description": prof.description,
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": prof.location
                },
                "aggregateRating": prof.rating > 0 ? {
                  "@type": "AggregateRating",
                  "ratingValue": prof.rating.toString(),
                  "bestRating": "5",
                  "worstRating": "0"
                } : undefined
              }
            }))
          }
        }
        return null
      
      case 'LocalBusiness':
        if (data) {
          return {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": data.name,
            "description": data.description,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": data.location
            },
            "telephone": data.phone,
            "email": data.email,
            "aggregateRating": data.rating > 0 ? {
              "@type": "AggregateRating",
              "ratingValue": data.rating.toString(),
              "bestRating": "5",
              "worstRating": "0"
            } : undefined,
            "priceRange": "$$"
          }
        }
        return null
      
      default:
        return null
    }
  }

  const structuredData = getStructuredData()

  if (!structuredData) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
