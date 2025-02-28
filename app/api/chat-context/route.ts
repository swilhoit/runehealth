import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// Use Node.js runtime for Supabase operations
export const runtime = "nodejs"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's lab results for context
    const { data: labResults, error: labError } = await supabase
      .from("lab_reports")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (labError) {
      throw labError
    }

    return NextResponse.json({
      context: labResults
        ? {
            hasResults: true,
            lastTestDate: new Date(labResults.created_at).toLocaleDateString(),
            biomarkers: labResults.biomarkers,
          }
        : {
            hasResults: false,
          },
    })
  } catch (error) {
    console.error("Error fetching chat context:", error)
    return NextResponse.json({ error: "Failed to fetch chat context" }, { status: 500 })
  }
}

