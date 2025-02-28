import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // TODO: Add your authentication logic here
    // For now, we'll just mock a successful login
    if (email && password) {
      // Mock successful login
      return NextResponse.json({
        success: true,
        user: {
          id: "1",
          name: "Test User",
          email: email,
        },
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid credentials",
      },
      { status: 401 },
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during login",
      },
      { status: 500 },
    )
  }
}

