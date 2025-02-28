import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // TODO: Add your registration logic here
    // For now, we'll just mock a successful registration
    if (name && email && password) {
      // Mock successful registration
      return NextResponse.json({
        success: true,
        user: {
          id: "1",
          name: name,
          email: email,
        },
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid registration data",
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during registration",
      },
      { status: 500 },
    )
  }
}

