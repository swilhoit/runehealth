/**
 * Domain configuration helper for Rune Health
 * This module centralizes domain management for the application
 */

export const DOMAINS = {
  // Main Webflow site
  MARKETING: 'https://rune.health',
  
  // Next.js application
  APP: process.env.NEXT_PUBLIC_BASE_URL || 'https://app.rune.health',
  
  // Development URL
  DEV: 'http://localhost:3000'
}

/**
 * Checks if the current environment is in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development'
}

/**
 * Gets the base URL for API requests
 */
export const getApiBaseUrl = (): string => {
  return isDevelopment() ? DOMAINS.DEV : DOMAINS.APP
}

/**
 * Constructs a fully qualified URL for the marketing site
 */
export const getMarketingUrl = (path: string = ''): string => {
  return `${DOMAINS.MARKETING}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Constructs a fully qualified URL for the app
 */
export const getAppUrl = (path: string = ''): string => {
  return `${DOMAINS.APP}${path.startsWith('/') ? path : `/${path}`}`
} 