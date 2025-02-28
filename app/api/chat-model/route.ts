import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { Logger } from "@/lib/logging"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { getApiKey, AIProvider } from "@/lib/api-key-utils"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// Explicitly set Edge runtime
export const runtime = "edge"

/**
 * Helper function to build the system prompt
 */
function buildSystemPrompt(labContext: any) {
  let systemPrompt = `You are RuneHealth, a helpful AI health assistant.
Be empathetic, clear, and focused on providing value to the user regarding their health.
You can discuss general health topics, but you must never provide medical diagnoses.
Always suggest consulting a healthcare professional for specific medical advice.`;

  // Add lab context if available
  if (labContext && labContext.hasResults) {
    systemPrompt += `\n\nYou have access to the user's lab report data. Here are their biomarkers:`;
    
    if (labContext.flaggedBiomarkers && labContext.flaggedBiomarkers.length > 0) {
      systemPrompt += `\n\nFlagged biomarkers outside of reference range:`;
      
      labContext.flaggedBiomarkers.forEach((biomarker: any) => {
        const direction = biomarker.value > biomarker.referenceHigh ? "high" : "low";
        systemPrompt += `\n- ${biomarker.name} (${biomarker.code}): ${biomarker.value} ${biomarker.unit} - ${direction} (ref range: ${biomarker.referenceLow}-${biomarker.referenceHigh})`;
      });
    }
  }

  return systemPrompt;
}

/**
 * Handler for the chat API endpoint - this demonstrates how to use the 
 * model settings from different providers.
 */
export async function POST(req: Request) {
  const logger = new Logger("api/chat-model")
  const operation = logger.startOperation("chat-completion")

  try {
    const { messages, labContext = null, reportId = null, modelSettings } = await req.json();
    
    // Extract model settings from the request
    const provider = modelSettings?.provider || "openai";
    const model = modelSettings?.model || "gpt-4o";
    
    // Get the API key - first try from the request, then from the user's saved keys
    let apiKey = modelSettings?.apiKeys?.[provider];
    
    // If no API key provided in the request, try to get it from the database or .env
    if (!apiKey) {
      apiKey = await getApiKey(provider as AIProvider);
    }
    
    logger.debug("Processing chat request", {
      messageCount: messages?.length,
      provider,
      model,
      hasApiKey: !!apiKey,
      hasLabContext: !!labContext,
      reportId
    });

    // System message with context
    const systemMessage = {
      role: "system", 
      content: buildSystemPrompt(labContext)
    };
    
    // Add system message as the first message if it doesn't exist
    const fullMessages = messages[0]?.role === "system" 
      ? messages 
      : [systemMessage, ...messages];

    // Different implementations based on provider
    switch (provider) {
      case "openai": {
        // Call OpenAI
        const response = await streamText({
          model: openai(model, { 
            apiKey,
            temperature: 0.7,
            maxTokens: 1500,
          }),
          messages: fullMessages,
        });
        
        logger.endOperation(operation, { success: true });
        return response;
      }
      
      case "anthropic": {
        // This is a simplified example - in production, you would use the Anthropic SDK
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model,
            messages: fullMessages.map(msg => ({
              role: msg.role === "system" ? "assistant" : msg.role,
              content: msg.content
            })),
            max_tokens: 1500,
            temperature: 0.7,
            stream: true
          })
        });
        
        logger.endOperation(operation, { success: true });
        return response;
      }
      
      case "groq": {
        // Simplified Groq API call
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages: fullMessages,
            max_tokens: 1500,
            temperature: 0.7,
            stream: true
          })
        });
        
        logger.endOperation(operation, { success: true });
        return response;
      }
      
      case "deepseek": {
        // Simplified DeepSeek API call
        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages: fullMessages,
            max_tokens: 1500,
            temperature: 0.7,
            stream: true
          })
        });
        
        logger.endOperation(operation, { success: true });
        return response;
      }
      
      default: {
        // Fallback to OpenAI with environment variable key
        // This ensures we can still function even if user keys fail
        const fallbackKey = process.env.OPENAI_API_KEY;
        
        const response = await streamText({
          model: openai("gpt-4o", { 
            apiKey: fallbackKey,
            temperature: 0.7,
            maxTokens: 1500,
          }),
          messages: fullMessages,
        });
        
        logger.endOperation(operation, { success: true });
        return response;
      }
    }
  } catch (error) {
    logger.error("Chat completion error", error);
    logger.endOperation(operation, { success: false, error });
    
    return new Response(
      JSON.stringify({
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
} 