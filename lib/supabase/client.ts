import { createClient } from "@supabase/supabase-js"
import { Database } from "./database.types"  // Updated import path to match your project

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

// Use this key for singleton storage
const SINGLETON_KEY = Symbol.for('app.supabase.client')

// Global for storing singleton across different modules
type GlobalWithInstance = typeof globalThis & {
  [SINGLETON_KEY]: ReturnType<typeof createClient<Database>> | undefined
}

// Create or retrieve the Supabase client singleton
export const supabase = (() => {
  // Check for existing instance in global context
  if (isBrowser && (globalThis as GlobalWithInstance)[SINGLETON_KEY]) {
    return (globalThis as GlobalWithInstance)[SINGLETON_KEY]!
  }
  
  // Check if we have the required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables')
    throw new Error('Missing Supabase environment variables')
  }
  
  // Create new instance
  const instance = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      },
    }
  )
  
  // Store in global for reuse
  if (isBrowser) {
    console.log('Creating new Supabase client instance and storing in global singleton')
    ;(globalThis as GlobalWithInstance)[SINGLETON_KEY] = instance
  }
  
  return instance
})()

