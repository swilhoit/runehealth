import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set")
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: "Hello, are you working?" }],
      max_tokens: 50,
    })

    const response = completion.choices[0].message.content
    return NextResponse.json({ status: "success", message: response })
  } catch (error) {
    console.error("Error testing OpenAI connection:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to OpenAI",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

