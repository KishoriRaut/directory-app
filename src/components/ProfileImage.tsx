'use client'

import { memo, useState, useEffect, useMemo } from 'react'
import { getInitials } from '@/lib/utils'

interface ProfileImageProps {
  imageUrl?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showBorder?: boolean
  verified?: boolean
  fallbackClassName?: string
}

const sizeClasses = {
  sm: 'w-16 h-16 text-lg',
  md: 'w-24 h-24 text-xl',
  lg: 'w-32 h-32 sm:w-40 sm:h-40 text-3xl sm:text-4xl',
  xl: 'w-40 h-40 sm:w-48 sm:h-48 text-4xl sm:text-5xl'
}

export const ProfileImage = memo(function ProfileImage({ 
  imageUrl, 
  name, 
  size = 'md',
  className = '',
  showBorder = true,
  verified = false,
  fallbackClassName = ''
}: ProfileImageProps) {
  const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)

  // Memoize initials calculation
  const initials = useMemo(() => getInitials(name), [name])

  // Create blob URL for better CORS handling if image URL is from Supabase
  useEffect(() => {
    if (imageUrl && imageUrl.includes('supabase.co') && !imageBlobUrl && !imageError) {
      const controller = new AbortController()
      
      fetch(imageUrl, { 
        mode: 'cors', 
        credentials: 'omit',
        signal: controller.signal
      })
        .then(async (response) => {
          if (response.ok) {
            const contentType = response.headers.get('content-type')
            if (contentType && contentType.startsWith('image/')) {
              const blob = await response.blob()
              if (blob.type.startsWith('image/')) {
                const url = URL.createObjectURL(blob)
                setImageBlobUrl(url)
              }
            }
          }
        })
        .catch(() => {
          // Silently fail - will use direct URL as fallback
        })

      return () => {
        controller.abort()
        if (imageBlobUrl) {
          URL.revokeObjectURL(imageBlobUrl)
        }
      }
    }
  }, [imageUrl, imageBlobUrl, imageError])

  const imageUrlToUse = imageBlobUrl || imageUrl
  const hasImage = imageUrlToUse && typeof imageUrlToUse === 'string' && imageUrlToUse.trim() !== ''
  const sizeClass = sizeClasses[size]
  const borderClass = showBorder ? 'border-4 border-white shadow-xl' : ''

  if (hasImage && !imageError) {
    return (
      <div className={`relative ${sizeClass} ${className}`}>
        <img
          src={imageUrlToUse}
          alt={`${name} profile`}
          className={`w-full h-full object-cover rounded-full ${borderClass} bg-white relative z-0`}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          loading="eager"
          onError={() => {
            setImageError(true)
          }}
        />
        {/* Fallback Avatar - Shows if image fails to load */}
        <div className={`profile-avatar-fallback hidden absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center ${borderClass} z-10 ${fallbackClassName}`}>
          <span className={`font-bold text-white ${sizeClass.includes('text-') ? '' : 'text-2xl'}`}>
            {initials}
          </span>
        </div>
        {verified && (
          <div className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg z-20">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    )
  }

  // No image or error - show fallback
  return (
    <div className={`relative ${sizeClass} ${className}`}>
      <div className={`w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center ${borderClass} relative ${fallbackClassName}`}>
        <span className={`font-bold text-white ${sizeClass.includes('text-') ? '' : 'text-2xl'}`}>
          {initials}
        </span>
        {verified && (
          <div className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg z-20">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for memo
  return prevProps.imageUrl === nextProps.imageUrl &&
         prevProps.name === nextProps.name &&
         prevProps.size === nextProps.size &&
         prevProps.verified === nextProps.verified
})
