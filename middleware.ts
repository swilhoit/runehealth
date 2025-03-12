import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  
  const supabase = createMiddlewareClient({ req: request, res })

  // Redirect ONLY the exact root path to Webflow site
  // This ensures other paths like /auth, /dashboard etc. work on app.rune.health
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect("https://rune.health")
  }

  // Refresh session if expired - this will update the session cookie if needed
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  // Handle authentication for protected routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!session) {
      // Store the original URL to redirect back after login
      const redirectUrl = new URL("/auth", request.url)
      redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Update response headers with new session cookie
    const response = NextResponse.next()
    response.headers.set("x-middleware-cache", "no-cache")
    return response
  }

  // For auth pages, redirect to dashboard if already authenticated
  if (request.nextUrl.pathname.startsWith("/auth") && session) {
    // Get the redirectedFrom parameter or default to dashboard
    const redirectedFrom = request.nextUrl.searchParams.get("redirectedFrom") || "/dashboard"
    return NextResponse.redirect(new URL(redirectedFrom, request.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
}

