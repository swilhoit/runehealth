import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { Logger } from "@/lib/logging"
import { cache } from "react"

// Log OpenAI configuration at startup
console.log("\n=== CHAT API CONFIGURATION ===");
console.log(`NODE_ENV: ${process.env.NODE_ENV || "not set"}`);
// Check if OpenAI API key is configured (safely)
if (process.env.OPENAI_API_KEY) {
  const keyFirstChars = process.env.OPENAI_API_KEY.substring(0, 3);
  const keyLastChars = process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4);
  console.log(`OpenAI API key is present: ${keyFirstChars}...${keyLastChars} (${process.env.OPENAI_API_KEY.length} chars)`);
} else {
  console.error("WARNING: OPENAI_API_KEY environment variable is not set!");
}
console.log("================================\n");

// Add a simple in-memory cache for system prompts
const systemPromptCache = new Map();

// Allow streaming responses up to 60 seconds
export const maxDuration = 60

// Explicitly set Edge runtime
export const runtime = "edge"

/**
 * Fetch lab context for a specific report ID
 */
async function fetchLabContext(reportId: string) {
  // Get the base URL for the API request - use hostname from the environment
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:' + (process.env.PORT || '3000');
  
  // Use relative URL which will work regardless of port
  const contextUrl = new URL(`/api/chat-context${reportId ? `?report_id=${reportId}` : ''}`, baseUrl);
  
  console.log(`Fetching context from: ${contextUrl.toString()}`);
  
  const contextResponse = await fetch(contextUrl, {
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      // Add cookies header for auth
      'Cookie': 'cross-site-cookie=whatever;' // This is a dummy cookie to enable credentials
    }
  });
  
  if (!contextResponse.ok) {
    throw new Error(`Failed to fetch lab context: ${contextResponse.status} ${contextResponse.statusText}`);
  }
  
  const contextData = await contextResponse.json();
  const labContext = contextData.context;
  
  console.log(`Lab context fetched successfully: ${labContext.hasResults ? 'has results' : 'no results'}`);
  
  if (labContext.hasResults) {
    console.log(`Report: ${labContext.report.labName} (${labContext.report.testDate})`);
    console.log(`Biomarkers: ${labContext.biomarkers.total} total, ${labContext.biomarkers.abnormal} abnormal`);
  }
  
  return labContext;
}

/**
 * Builds a system prompt with lab report context and survey data
 * Now memoized for better performance
 */
const buildSystemPrompt = cache(function(labContext: any) {
  // Check if we have a cached prompt for this context
  const contextHash = labContext ? JSON.stringify({
    surveyId: labContext.survey?.id,
    reportId: labContext.report?.id,
    healthScore: labContext.healthScore
  }) : 'no-context';
  
  if (systemPromptCache.has(contextHash)) {
    console.log("Using cached system prompt");
    return systemPromptCache.get(contextHash);
  }
  
  console.log("Building new system prompt");
  
  let systemPrompt = `You are RuneHealth, a helpful AI health assistant.
Be empathetic, clear, and focused on providing value to the user regarding their health.
You can discuss general health topics, but you must never provide medical diagnoses.
Always suggest consulting a healthcare professional for specific medical advice.

IMPORTANT: Keep your responses brief and concise. Users prefer shorter responses that are easier to read.
- Use 2-3 sentences maximum per paragraph
- Limit responses to 2-4 short paragraphs total
- Get straight to the point with no preamble
- Use short, direct sentences
- Prioritize only the most relevant information
- Avoid any unnecessary background information
- For lists, include only 2-3 key points
- Focus on actionable advice`;

  // Add information about health surveys if available
  if (labContext?.survey) {
    systemPrompt += `\n\nThe user has completed a health survey on ${labContext.survey.completedDate}.`;
    
    // Add basic information from the survey
    const surveyData = labContext.survey.data;
    if (surveyData) {
      // Add general health information
      if (surveyData.age || surveyData.gender) {
        systemPrompt += `\nThe user is a ${surveyData.age ? surveyData.age + " year old " : ""}${surveyData.gender || ""}.`;
      }
      
      // Add physical metrics if available
      if (surveyData.height || surveyData.weight) {
        systemPrompt += `\nPhysical stats: `;
        if (surveyData.height) {
          systemPrompt += `Height: ${surveyData.height} cm. `;
        }
        if (surveyData.weight) {
          systemPrompt += `Weight: ${surveyData.weight} kg.`;
        }
      }
      
      // Add reported symptoms if available
      if (surveyData.symptoms && surveyData.symptoms.length > 0) {
        systemPrompt += `\n\nReported symptoms include:`;
        surveyData.symptoms.forEach((symptom: string) => {
          systemPrompt += `\n- ${symptom}`;
        });
      }
      
      // Add health goals if available
      if (surveyData.healthGoals && surveyData.healthGoals.length > 0) {
        systemPrompt += `\n\nTheir health goals include:`;
        surveyData.healthGoals.forEach((goal: string) => {
          systemPrompt += `\n- ${goal}`;
        });
      }
      
      // Add dietary habits if available
      if (surveyData.dietaryHabits && surveyData.dietaryHabits.length > 0) {
        systemPrompt += `\n\nDietary habits: ${surveyData.dietaryHabits.join(", ")}.`;
      }
      
      // Add lifestyle metrics if available
      systemPrompt += `\n\nLifestyle metrics:`;
      if (surveyData.sleepQuality !== undefined) {
        const sleepQualityDesc = surveyData.sleepQuality >= 7 ? "good" : 
                                 surveyData.sleepQuality >= 4 ? "average" : "poor";
        systemPrompt += `\n- Sleep quality: ${surveyData.sleepQuality}/10 (${sleepQualityDesc})`;
      }
      
      if (surveyData.stressLevel !== undefined) {
        const stressLevelDesc = surveyData.stressLevel >= 7 ? "high" : 
                               surveyData.stressLevel >= 4 ? "moderate" : "low";
        systemPrompt += `\n- Stress level: ${surveyData.stressLevel}/10 (${stressLevelDesc})`;
      }
      
      if (surveyData.exerciseFrequency !== undefined) {
        systemPrompt += `\n- Exercise: ${surveyData.exerciseFrequency} days per week`;
      }
      
      if (surveyData.waterIntake !== undefined) {
        systemPrompt += `\n- Water intake: ${surveyData.waterIntake} glasses per day`;
      }
    }
    
    // Include AI-generated recommendations if available
    if (labContext.survey.recommendations?.ai) {
      const aiRecs = labContext.survey.recommendations.ai;
      
      if (aiRecs.summary) {
        systemPrompt += `\n\nHealth survey summary: ${aiRecs.summary}`;
      }
      
      // Include a sample of recommendations if available
      const allRecommendations = [
        ...(aiRecs.nutritionRecommendations || []).map((r: string) => `Nutrition: ${r}`),
        ...(aiRecs.lifestyleRecommendations || []).map((r: string) => `Lifestyle: ${r}`),
        ...(aiRecs.activityIdeas || []).map((r: string) => `Activity: ${r}`)
      ];
      
      if (allRecommendations.length > 0) {
        systemPrompt += `\n\nKey recommendations from their health survey:`;
        // Limit to 5 recommendations to keep the prompt reasonable
        allRecommendations.slice(0, 5).forEach((rec: string) => {
          systemPrompt += `\n- ${rec}`;
        });
        
        if (allRecommendations.length > 5) {
          systemPrompt += `\n- Plus ${allRecommendations.length - 5} more recommendations`;
        }
      }
    }
  }

  if (!labContext?.hasResults) {
    systemPrompt += `\n\nThe user doesn't have any lab results uploaded yet. You can encourage them to upload their lab reports to get personalized insights.`;
    return systemPrompt;
  }

  // Include information about the current report
  systemPrompt += `\n\nThe user has lab results from ${labContext.report.labName} taken on ${labContext.report.testDate}.
They have ${labContext.biomarkers.total} biomarkers in their report, with ${labContext.biomarkers.abnormal} abnormal results.
Their overall health score is ${labContext.healthScore !== null ? labContext.healthScore : 'not calculated'} out of 10.`;

  // Add information about abnormal biomarkers if any exist
  const abnormalBiomarkers: any[] = [];
  Object.entries(labContext.biomarkers.byCategory).forEach(([category, biomarkers]: [string, any]) => {
    biomarkers.forEach((biomarker: any) => {
      if (biomarker.in_range === false) {
        abnormalBiomarkers.push({
          name: biomarker.name,
          value: biomarker.value,
          unit: biomarker.unit,
          category,
          flag: biomarker.flag
        });
      }
    });
  });

  if (abnormalBiomarkers.length > 0) {
    systemPrompt += `\n\nAbnormal biomarkers include:`;
    abnormalBiomarkers.forEach(biomarker => {
      systemPrompt += `\n- ${biomarker.name}: ${biomarker.value} ${biomarker.unit} (${biomarker.flag})`;
    });
  }

  // Add insights if available
  if (labContext.insights && (labContext.insights.observation?.length || labContext.insights.recommendation?.length)) {
    systemPrompt += `\n\nKey insights from their lab report:`;
    
    if (labContext.insights.observation?.length) {
      labContext.insights.observation.forEach((insight: any) => {
        systemPrompt += `\n- Observation: ${insight.content}`;
      });
    }
    
    if (labContext.insights.recommendation?.length) {
      labContext.insights.recommendation.forEach((insight: any) => {
        systemPrompt += `\n- Recommendation: ${insight.content}`;
      });
    }
  }

  // Add information about previous reports if available
  if (labContext.previousReports && labContext.previousReports.length > 0) {
    systemPrompt += `\n\nThe user has ${labContext.previousReports.length} previous lab reports:`;
    labContext.previousReports.forEach((report: any, index: number) => {
      systemPrompt += `\n- ${report.labName} (${report.testDate})${index === 0 ? ' - most recent previous report' : ''}`;
    });
    systemPrompt += `\n\nYou can suggest comparing their current results with previous reports when relevant.`;
  }

  systemPrompt += `\n\nYou can reference this lab data when answering the user's questions. If they ask about specific biomarkers not mentioned here, you can check the full results in their categories.
Be specific when discussing their results, but avoid making definitive medical conclusions.`;

  // Cache the result
  systemPromptCache.set(contextHash, systemPrompt);
  return systemPrompt;
});

export async function POST(req: Request) {
  console.log("\n=== CHAT API REQUEST ===");
  const requestStartTime = Date.now();
  console.log(`Request URL: ${req.url}`);
  console.log(`Request method: ${req.method}`);
  
  // Log headers to help debug auth issues
  try {
    const headerEntries = [...req.headers.entries()];
    console.log(`Request headers: ${JSON.stringify(
      headerEntries.filter(([key]) => !key.includes('cookie')), // Filter out cookies for privacy
      null, 2
    )}`);
  } catch (headerError) {
    console.error("Could not log headers:", headerError);
  }
  
  const logger = new Logger("api/chat")
  const operation = logger.startOperation("chat-completion")
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`Chat request ID: ${requestId}`);

  try {
    console.log("Attempting to parse request body...");
    let messageData;
    try {
      messageData = await req.json();
      console.log("Request body successfully parsed");
    } catch (parseError: any) {
      console.error("Failed to parse request JSON:", parseError);
      return new Response(
        JSON.stringify({
          error: "Request parsing error",
          message: parseError.message || 'Unknown parsing error',
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const { messages } = messageData;
    console.log(`Messages received: ${messages?.length || 0}`);
    
    logger.debug("Processing chat request", {
      messageCount: messages?.length,
      lastMessage: messages?.[messages?.length - 1],
    })

    if (!messages || !Array.isArray(messages)) {
      console.error("Invalid messages format:", typeof messages);
      return new Response(
        JSON.stringify({
          error: "Invalid messages format",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      console.log(`Last message (${lastMessage?.content?.length || 0} chars): "${lastMessage?.content?.substring(0, 50)}..."`);
    }
    
    // Get model settings from request body
    const { modelSettings = {}, reportId } = messageData;
    const provider = modelSettings.provider || 'openai';
    const model = modelSettings.model || 'gpt-4o';
    
    // Log model information
    console.log(`Using model: ${provider} / ${model}`);
    
    // Generate simplified system prompt - we'll skip the detailed lab context for now
    // to avoid the database access issues
    const systemMessage = {
      role: "system",
      content: "You are RuneHealth, a helpful AI health assistant that provides information about health and wellness. Keep responses brief and direct."
    };
    
    // Log time taken to prepare request
    const prepTime = Date.now() - requestStartTime;
    console.log(`Request preparation time: ${prepTime}ms`);
    
    // Update the OpenAI API request with the system message and directly return the result
    // This avoids potential response handling issues
    try {
      const result = await streamText({
        model: openai(model),
        messages: [
          systemMessage,
          ...messages
        ],
        temperature: 0.7,
        maxTokens: 1000, // Limit token count for faster responses
      });

      // Check if we got a valid response
      if (!result) {
        throw new Error("No response generated from AI");
      }
      
      // Log completion time
      const completionTime = Date.now() - requestStartTime;
      console.log(`Chat completion time: ${completionTime}ms`);
      console.log(`Successfully generated response`);
      
      // Close the logger operation before returning
      operation.end();
      
      console.log("Returning streaming response");
      // The result from streamText() is already a Response object, so we can return it directly
      return result;
    } catch (aiError) {
      console.error("AI API error:", aiError);
      throw aiError; // Re-throw to be caught by the outer try/catch
    }
  } catch (error: any) {
    const errorTime = Date.now() - requestStartTime;
    console.error(`[${new Date().toISOString()}] Chat error:`, error);
    
    // Log detailed error information
    const errorDetails = {
      message: error instanceof Error ? error.message : String(error),
      type: error?.constructor?.name || 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      requestId
    };
    console.error("Error details:", JSON.stringify(errorDetails, null, 2));
    
    operation.fail(error)
    
    // Log total request time
    const totalTime = Date.now() - requestStartTime;
    console.log(`Total request processing time: ${totalTime}ms`);
    
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        message: error instanceof Error ? error.message : String(error),
        requestId,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "unknown",
        apiKeyPresent: !!process.env.OPENAI_API_KEY,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "X-Error": "Chat Error",
          "X-Request-ID": requestId
        },
      }
    );
  }
}

