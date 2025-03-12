import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Adds CORS headers to the response for cross-domain API requests
 * between rune.health and app.rune.health
 */
export function addCorsHeaders(req: NextRequest, res: NextResponse) {
  // Get the origin from the request headers
  const origin = req.headers.get('origin') || ''
  
  // Check if the origin is allowed (only allow rune.health and its subdomains)
  const allowedOrigins = [
    'https://rune.health',
    'https://www.rune.health',
    'https://app.rune.health'
  ]
  
  // Allow requests from localhost in development
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000')
  }
  
  // Set CORS headers if the origin is allowed
  if (allowedOrigins.includes(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  
  return res
} 