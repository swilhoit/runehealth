import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { Logger } from "@/lib/logging"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// Explicitly set Edge runtime
export const runtime = "edge"

export async function POST(req: Request) {
  const logger = new Logger("api/chat")
  const operation = logger.startOperation("chat-completion")

  try {
    const { messages } = await req.json()

    logger.debug("Processing chat request", {
      messageCount: messages?.length,
      lastMessage: messages?.[messages?.length - 1],
    })

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid messages format")
    }

    const result = streamText({
      model: openai("gpt-4"),
      system: "You are a helpful health assistant. Keep responses brief and informative.",
      messages,
    })

    operation.end({ status: "success" })

    return result.toDataStreamResponse()
  } catch (error) {
    operation.fail(error)

    // Return error response compatible with Edge runtime
    return new Response(
      JSON.stringify({
        error: "Chat processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
        requestId: logger.requestId,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

