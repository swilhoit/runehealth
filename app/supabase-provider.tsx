'use client'

import { useEffect } from 'react'

export function SupabaseFetchInterceptor() {
  useEffect(() => {
    // Dynamically import the fetch interceptor in the browser
    const loadInterceptor = async () => {
      try {
        await import('@/lib/supabase/intercept-fetch')
        console.log('Supabase fetch interceptor loaded')
      } catch (error) {
        console.error('Failed to load Supabase fetch interceptor:', error)
      }
    }

    loadInterceptor()
  }, [])

  // This component doesn't render anything
  return null
} 