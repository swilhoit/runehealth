import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  const { name, email, password } = await request.json()
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    })

    if (signUpError) {
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      )
    }

    if (signUpData.user) {
      // Create a profile record in the profiles table
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: signUpData.user.id,
          full_name: name,
          email: email,
        },
      ])

      if (profileError) {
        console.error("Profile creation error:", profileError)
        // Continue even if profile creation fails, as we can create it later
      }

      return NextResponse.json(
        { success: true, user: signUpData.user },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: "User creation failed" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

