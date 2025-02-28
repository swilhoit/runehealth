import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Logger } from "@/lib/logging"

// No runtime export - defaults to Node.js runtime
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const logger = new Logger("api/chat-node")
  const operation = logger.startOperation("chat-completion")

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("Authentication required")
    }

    logger.setUserId(user.id)

    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid messages format")
    }

    // Manual streaming with fetch
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful health assistant. Keep responses brief and informative.",
          },
          ...messages,
        ],
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `OpenAI API error: ${response.statusText}`)
    }

    operation.end({ status: "success" })

    // Transform the response into a proper stream
    const transformStream = new TransformStream()
    const writer = transformStream.writable.getWriter()
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    // Process the stream
    const reader = response.body?.getReader()
    if (!reader) throw new Error("No response body")

    // Start the streaming process
    void (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          // Parse the chunks and write them to the transform stream
          const chunk = decoder.decode(value)
          const lines = chunk.split("\n").filter((line) => line.trim() !== "" && line.trim() !== "data: [DONE]")

          for (const line of lines) {
            if (line.includes("data: ")) {
              try {
                const data = JSON.parse(line.replace("data: ", ""))
                const text = data.choices[0]?.delta?.content || ""
                if (text) {
                  await writer.write(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
                }
              } catch (e) {
                console.error("Error parsing SSE message:", e)
              }
            }
          }
        }
      } catch (error) {
        console.error("Error processing stream:", error)
      } finally {
        await writer.close()
      }
    })()

    return new Response(transformStream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    operation.fail(error)

    return NextResponse.json(
      {
        error: "Chat processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
        requestId: logger.requestId,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

