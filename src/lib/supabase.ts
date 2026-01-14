import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// Create singleton instance to prevent multiple clients
let supabaseInstance: ReturnType<typeof createClient> | null = null

// Helper function to clear invalid session
async function clearInvalidSession() {
  if (typeof window === 'undefined') return
  
  try {
    // Clear Supabase auth tokens from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') && key.includes('auth')) {
        localStorage.removeItem(key)
      }
    })
    // Sign out to clear any remaining session state
    await supabaseInstance?.auth.signOut()
  } catch {
    // Ignore storage errors
  }
}

// Track if we're already handling a refresh token error to prevent loops
let isHandlingRefreshError = false

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        flowType: 'pkce',
      },
      global: {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // Intercept fetch to handle refresh token errors and missing column errors gracefully
        fetch: async (url, options = {}) => {
          try {
            const response = await fetch(url, options)
            
            // Handle refresh token errors on auth endpoint
            if (!response.ok && url.toString().includes('/auth/v1/token')) {
              const clonedResponse = response.clone()
              try {
                const errorData = await clonedResponse.json()
                
                // Only handle if error message specifically mentions refresh token
                const errorDesc = errorData.error_description || ''
                const isRefreshTokenError =
                  errorDesc.includes('Refresh Token') ||
                  errorDesc.includes('refresh_token') ||
                  (errorDesc.toLowerCase().includes('refresh') && 
                   errorDesc.toLowerCase().includes('token') &&
                   !errorDesc.toLowerCase().includes('password'))
                
                if (isRefreshTokenError && !isHandlingRefreshError) {
                  isHandlingRefreshError = true
                  // Clear invalid session silently in the background
                  clearInvalidSession().catch(() => {
                    // Ignore errors during cleanup
                  })
                }
              } catch {
                // If we can't parse the error, just return the original response
              }
            }
            
            // Handle missing column errors (is_visible) - suppress console errors
            // The application code will handle the fallback, we just suppress the noise
            if (!response.ok && url.toString().includes('/rest/v1/professionals') && response.status === 400) {
              const clonedResponse = response.clone()
              try {
                const errorData = await clonedResponse.json()
                const errorMessage = errorData.message || errorData.error_description || ''
                
                // Check if it's a missing column error for is_visible
                const isMissingColumnError = 
                  errorMessage.includes('is_visible') ||
                  errorMessage.includes('column') && errorMessage.includes('does not exist') ||
                  errorData.code === '42703' ||
                  (errorData.details && errorData.details.includes('is_visible'))
                
                if (isMissingColumnError) {
                  // Suppress the error - application code will handle fallback
                  // Return the response so the app can detect and retry
                  return response
                }
              } catch {
                // If we can't parse, return original response
              }
            }
            
            // Always return the original response - don't modify it
            return response
          } catch (error) {
            // If it's a refresh token error, handle it gracefully
            if (
              error instanceof Error &&
              (error.message.includes('Refresh Token') ||
                error.message.includes('refresh_token')) &&
              !isHandlingRefreshError
            ) {
              isHandlingRefreshError = true
              clearInvalidSession().catch(() => {
                // Ignore errors during cleanup
              })
            }
            throw error
          } finally {
            // Reset the flag after a short delay
            setTimeout(() => {
              isHandlingRefreshError = false
            }, 1000)
          }
        },
      },
    })

    // Handle auth state changes and refresh token errors
    if (typeof window !== 'undefined') {
      supabaseInstance.auth.onAuthStateChange(async (event, session) => {
        // Handle token refresh errors
        if (event === 'TOKEN_REFRESHED' && !session) {
          // Token refresh failed, clear session
          await clearInvalidSession()
        }
        
        // Clear invalid tokens from storage on sign out or failed refresh
        if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
          await clearInvalidSession()
        }
      })

      // Handle unhandled promise rejections for auth errors
      window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason
        if (
          error &&
          typeof error === 'object' &&
          ('message' in error || 'error_description' in error)
        ) {
          const errorMessage = 
            (error as { message?: string; error_description?: string }).message ||
            (error as { error_description?: string }).error_description ||
            String(error)
          
          if (
            errorMessage.includes('Refresh Token') ||
            errorMessage.includes('refresh_token') ||
            (errorMessage.includes('Invalid') && errorMessage.includes('Token'))
          ) {
            // Prevent the error from being logged
            event.preventDefault()
            // Clear invalid session
            clearInvalidSession().catch(() => {
              // Ignore errors during cleanup
            })
          }
        }
      })
    }
  }
  return supabaseInstance
})()

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key'
  )
}

/**
 * Check if is_visible column exists in the database
 * Uses a cached value to avoid repeated checks
 */
export const checkIsVisibleColumnExists = (): boolean => {
  if (typeof window === 'undefined') return true
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).__isVisibleColumnExists !== false
}

/**
 * Set the cached value for is_visible column existence
 */
export const setIsVisibleColumnExists = (exists: boolean): void => {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__isVisibleColumnExists = exists
  }
}

/**
 * Check if an error is related to a missing column (specifically is_visible)
 */
export const isMissingColumnError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any
  return (
    err.code === '42703' || 
    err.message?.includes('is_visible') || 
    err.message?.includes('column') ||
    err.message?.includes('does not exist') ||
    err.details?.includes('is_visible') ||
    err.hint?.includes('is_visible')
  )
}

/**
 * Build base professionals query with services join
 * This is a common pattern used across multiple components
 */
export const buildProfessionalsQuery = (includeCount: boolean = false) => {
  const selectOptions = includeCount ? { count: 'exact' as const } : undefined
  return supabase
    .from('professionals')
    .select(`
      *,
      services (
        service_name
      )
    `, selectOptions)
}
