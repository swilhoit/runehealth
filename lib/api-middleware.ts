import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function withErrorHandling(
  req: NextRequest,
  handler: (req: NextRequest, supabase: any) => Promise<Response>,
): Promise<Response> {
  try {
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Execute the handler
    const response = await handler(req, supabase)
    return response
  } catch (error) {
    console.error("API Error:", error)

    // Log to monitoring service
    // Sentry.captureException(error)

    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
      { status: 500 },
    )
  }
}

export function validateContentType(req: NextRequest, contentType: string): boolean {
  return req.headers.get("content-type")?.includes(contentType) ?? false
}

export function validateMethod(req: NextRequest, allowedMethods: string[]): boolean {
  return allowedMethods.includes(req.method)
}

