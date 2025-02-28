import type { NextRequest } from "next/server"

interface RateLimitState {
  timestamp: number
  count: number
}

class RateLimit {
  private cache: Map<string, RateLimitState>
  private readonly cleanupInterval: number = 1000 * 60 * 5 // 5 minutes

  constructor() {
    this.cache = new Map()

    // Cleanup old entries periodically
    setInterval(() => this.cleanup(), this.cleanupInterval)
  }

  private getIP(request: NextRequest): string {
    return request.ip ?? request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1"
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cleanupInterval) {
        this.cache.delete(key)
      }
    }
  }

  async check(
    request: NextRequest,
    limit: number,
    windowMs = 60000, // 1 minute default
  ): Promise<{ success: boolean; remaining: number }> {
    const ip = this.getIP(request)
    const now = Date.now()
    const state = this.cache.get(ip)

    if (!state) {
      this.cache.set(ip, { timestamp: now, count: 1 })
      return { success: true, remaining: limit - 1 }
    }

    if (now - state.timestamp > windowMs) {
      // Reset if window has passed
      this.cache.set(ip, { timestamp: now, count: 1 })
      return { success: true, remaining: limit - 1 }
    }

    const newCount = state.count + 1
    this.cache.set(ip, { timestamp: state.timestamp, count: newCount })

    return {
      success: newCount <= limit,
      remaining: Math.max(0, limit - newCount),
    }
  }
}

// Create a singleton instance
export const rateLimit = new RateLimit()

