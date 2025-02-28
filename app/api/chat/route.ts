import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { Logger } from "@/lib/logging"

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

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// Explicitly set Edge runtime
export const runtime = "edge"

/**
 * Builds a system prompt with lab report context and survey data
 */
function buildSystemPrompt(labContext: any) {
  let systemPrompt = `You are RuneHealth, a helpful AI health assistant.
Be empathetic, clear, and focused on providing value to the user regarding their health.
You can discuss general health topics, but you must never provide medical diagnoses.
Always suggest consulting a healthcare professional for specific medical advice.

IMPORTANT: Keep your responses brief and concise. Users prefer shorter responses that are easier to read.
- Use 3-4 sentences maximum per paragraph
- Limit responses to 3-5 short paragraphs total
- Get straight to the point with minimal preamble
- Use short, direct sentences rather than complex ones
- Prioritize the most relevant information only
- Avoid unnecessary background information unless explicitly requested
- For lists, include only 2-4 key points
- Focus on actionable advice rather than explanations

When responding, please:
- Break your responses into clear, logical sections
- Use markdown formatting for better readability (bold, lists, etc.)
- Label recommendations clearly using **Recommendation:** format
- For summaries or conclusions, use **Summary:** format
- Keep paragraphs reasonably short and focused
- Use bullet points for lists or multiple options
- Use headings (## or ###) to organize longer responses
- If providing warnings, mark them with **Warning:**`;

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

  return systemPrompt;
}

export async function POST(req: Request) {
  console.log("\n=== CHAT API REQUEST ===");
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
      throw new Error(`Request parsing error: ${parseError.message || 'Unknown parsing error'}`);
    }
    
    const { messages } = messageData;
    console.log(`Messages received: ${messages?.length || 0}`);
    
    logger.debug("Processing chat request", {
      messageCount: messages?.length,
      lastMessage: messages?.[messages?.length - 1],
    })

    if (!messages || !Array.isArray(messages)) {
      console.error("Invalid messages format:", typeof messages);
      throw new Error("Invalid messages format")
    }
    
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      console.log(`Last message (${lastMessage?.content?.length || 0} chars): "${lastMessage?.content?.substring(0, 50)}..."`);
    }
    
    // Check for a specified report ID in the request
    const reportId = messageData.reportId;
    console.log(`Report ID specified in request: ${reportId || 'none (will use latest)'}`);
    
    // Fetch lab context for this user
    console.log("Fetching lab context...");
    let labContext = null;
    try {
      // Get the base URL for the API request
      const baseUrl = new URL(req.url).origin;
      const contextUrl = new URL(`/api/chat-context${reportId ? `?report_id=${reportId}` : ''}`, baseUrl);
      
      console.log(`Fetching context from: ${contextUrl.toString()}`);
      
      // Get authorization headers from original request to forward
      const headers: Record<string, string> = {};
      const authHeader = req.headers.get('authorization');
      const cookieHeader = req.headers.get('cookie');
      
      if (authHeader) headers['authorization'] = authHeader;
      if (cookieHeader) headers['cookie'] = cookieHeader;
      
      const contextResponse = await fetch(contextUrl, {
        headers,
        credentials: 'include',
        cache: 'no-store'
      });
      
      if (!contextResponse.ok) {
        console.error(`Failed to fetch lab context: ${contextResponse.status} ${contextResponse.statusText}`);
        const errorText = await contextResponse.text().catch(() => 'Could not read error response');
        console.error(`Error response: ${errorText.substring(0, 200)}`);
        // Create a basic context
        labContext = { hasResults: false };
      } else {
        const contextData = await contextResponse.json();
        labContext = contextData.context;
        console.log(`Lab context fetched successfully: ${labContext.hasResults ? 'has results' : 'no results'}`);
        
        if (labContext.hasResults) {
          console.log(`Report: ${labContext.report.labName} (${labContext.report.testDate})`);
          console.log(`Biomarkers: ${labContext.biomarkers.total} total, ${labContext.biomarkers.abnormal} abnormal`);
          if (labContext.previousReports) {
            console.log(`Previous reports: ${labContext.previousReports.length}`);
          }
        }

        // Log whether survey data is available
        if (labContext?.survey) {
          logger.info("Survey data available for chat", {
            surveyDate: labContext.survey.completedDate,
            hasSurveyAIRecs: !!labContext.survey.recommendations?.ai
          });
        } else {
          logger.debug("No survey data available for this chat session");
        }
      }
    } catch (contextError) {
      console.error("Error fetching lab context:", contextError);
      // Create a basic context
      labContext = { hasResults: false };
    }
    
    // Add lab context to message data for subsequent processing
    messageData.labContext = labContext;
    
    console.log("Creating streaming response...");
    const startTime = Date.now();
    
    try {
      // Try to fetch OpenAI API directly to test connectivity
      console.log("Testing OpenAI connectivity before streaming...");
      const testResponse = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (testResponse.ok) {
        console.log("OpenAI connectivity test successful");
      } else {
        console.warn(`OpenAI connectivity test failed: ${testResponse.status} ${testResponse.statusText}`);
      }
    } catch (testError: any) {
      console.warn(`OpenAI connectivity test error: ${testError.message || 'Unknown error'}`);
      // Continue anyway - this is just diagnostic
    }
    
    let streamResult;
    try {
      console.log("Calling streamText with messages length:", messages.length);
      streamResult = streamText({
        model: openai("gpt-4o-mini"),
        system: buildSystemPrompt(messageData.labContext),
        messages,
        temperature: 0.7,
      });
      
      console.log(`Stream initialized in ${Date.now() - startTime}ms`);
    } catch (streamError: any) {
      console.error("Failed to initialize stream:", streamError);
      throw new Error(`Stream initialization failed: ${streamError.message || 'Unknown streaming error'}`);
    }
    
    operation.end({ status: "success" })
    
    console.log("Returning stream response to client");
    try {
      const streamResponse = streamResult.toDataStreamResponse();
      console.log("Stream response created successfully");
      return streamResponse;
    } catch (responseError: any) {
      console.error("Failed to create stream response:", responseError);
      throw new Error(`Response creation failed: ${responseError.message || 'Unknown response error'}`);
    }
  } catch (error) {
    const errorTime = Date.now();
    console.error(`[${new Date(errorTime).toISOString()}] Chat error:`, error);
    
    // Log detailed error information
    const errorDetails = {
      message: error instanceof Error ? error.message : String(error),
      type: error?.constructor?.name || 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date(errorTime).toISOString(),
      requestId
    };
    console.error("Error details:", JSON.stringify(errorDetails, null, 2));
    
    operation.fail(error)

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
    )
  }
}

