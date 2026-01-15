'use client'

import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'
import { useEffect, useRef, useState } from 'react'

/**
 * Reusable hook for authentication checking
 * Eliminates duplicate auth logic across components
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const authCheckedRef = useRef(false)
  
  useEffect(() => {
    // Prevent double execution in StrictMode
    if (authCheckedRef.current) return
    authCheckedRef.current = true
    
    let isCancelled = false
    
    const checkAuth = async () => {
      if (isCancelled) return
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (isCancelled) return
        
        if (error) {
          // Handle refresh token errors
          if (error.message?.includes('Refresh Token') || error.message?.includes('refresh_token')) {
            await supabase.auth.signOut()
            if (!isCancelled) {
              setUser(null)
              setLoading(false)
            }
            return
          }
          console.error('Auth error:', error)
        }
        if (!isCancelled) {
          setUser(session?.user || null)
          setLoading(false)
        }
      } catch (error: unknown) {
        if (isCancelled) return
        
        // Handle any unexpected errors
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('Refresh Token') || errorMessage.includes('refresh_token')) {
          await supabase.auth.signOut()
        }
        if (!isCancelled) {
          setUser(null)
          setLoading(false)
        }
      }
    }
    
    checkAuth()

    let subscription: { unsubscribe: () => void } | undefined
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isCancelled) {
          setUser(session?.user || null)
        }
      })
      subscription = data?.subscription
    } catch (error) {
      if (!isCancelled) {
        console.error('Error setting up auth listener:', error)
      }
    }

    return () => {
      isCancelled = true
      if (subscription) {
        try {
          subscription.unsubscribe()
        } catch (error) {
          // Ignore unsubscribe errors
        }
      }
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, loading, signOut }
}
