import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Return the current environment variables and base URLs
    // This is helpful for debugging deployment issues
    return NextResponse.json({
      success: true,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      host: 'app.rune.health',
      message: 'Auth configuration is set for app.rune.health'
    })
  } catch (error) {
    console.error('Error in auth config route:', error)
    return NextResponse.json({ error: 'Failed to get auth configuration' }, { status: 500 })
  }
} 