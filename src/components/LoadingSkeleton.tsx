'use client'

interface LoadingSkeletonProps {
  variant?: 'categories' | 'how-it-works' | 'featured' | 'testimonials' | 'statistics'
  className?: string
}

/**
 * Reusable loading skeleton component to eliminate duplicate loading code
 */
export function LoadingSkeleton({ variant = 'categories', className = '' }: LoadingSkeletonProps) {
  const baseClasses = 'py-12 sm:py-16'
  
  switch (variant) {
    case 'categories':
      return (
        <div className={`${baseClasses} bg-white ${className}`}>
          <div className="container mx-auto px-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    
    case 'how-it-works':
      return (
        <div className={`${baseClasses} bg-gray-50 ${className}`}>
          <div className="container mx-auto px-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-48 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-80 mx-auto"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    
    case 'featured':
      return (
        <div className={`${baseClasses} bg-white ${className}`}>
          <div className="container mx-auto px-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    
    case 'testimonials':
      return (
        <div className={`${baseClasses} bg-white ${className}`}>
          <div className="container mx-auto px-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-80 mx-auto"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    
    case 'statistics':
      return (
        <div className={`${baseClasses} bg-indigo-600 ${className}`}>
          <div className="container mx-auto px-6">
            <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-indigo-500 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      )
    
    default:
      return null
  }
}
