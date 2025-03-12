import { NextResponse } from 'next/server';
import { Logger } from "@/lib/logging";
import OpenAI from 'openai';

// Set the runtime to Edge for better performance
export const runtime = 'edge';

export async function POST(req: Request) {
  console.log("=== CHAT API INVOKED ===");
  const logger = new Logger("api/chat");
  const requestId = crypto.randomUUID();
  
  try {
    // Parse request body
    const { messages, modelSettings = {} } = await req.json();
    
    // Use default model if not specified
    const model = modelSettings?.model || 'gpt-4o';
    
    // Get the context information if available
    const contextParam = req.url && new URL(req.url).searchParams.get('context');
    const contextId = contextParam || '';
    let contextData = null;
    
    // Attempt to fetch context data
    try {
      if (contextId) {
        console.log(`Fetching context data for ID: ${contextId}`);
        const contextUrl = `${new URL(req.url).origin}/api/chat-context?report_id=${contextId}`;
        console.log("Context URL:", contextUrl);
        
        // Pass authentication cookies from the original request
        const cookieHeader = req.headers.get('cookie');
        const headers: Record<string, string> = {};
        
        if (cookieHeader) {
          console.log("Forwarding authentication cookies");
          headers['cookie'] = cookieHeader;
        } else {
          console.log("No cookies found in original request");
        }
        
        const contextResponse = await fetch(contextUrl, { 
          headers,
          credentials: 'include'
        });
        
        console.log("Context response status:", contextResponse.status);
        
        if (contextResponse.ok) {
          contextData = await contextResponse.json();
          console.log("Context data received:", JSON.stringify(contextData).substring(0, 200) + "...");
          console.log("Has results:", contextData?.context?.hasResults);
          console.log("Has biomarkers:", !!contextData?.context?.biomarkers);
          console.log("Has survey:", !!contextData?.context?.survey);
        } else {
          console.error("Failed to fetch context data:", contextResponse.status);
          // Try to log the error response
          try {
            const errorText = await contextResponse.text();
            console.error("Error response:", errorText.substring(0, 500));
          } catch (e) {
            console.error("Could not read error response");
          }
        }
      } else {
        console.log("No context ID provided, skipping context fetch");
      }
    } catch (contextError) {
      console.error("Error fetching context:", contextError);
    }
    
    // Build a detailed system message with the user's health data if available
    let systemContent = "You are RuneHealth, a helpful AI health assistant that provides information about health and wellness. Keep responses brief and direct.";
    
    if (contextData && contextData.context && contextData.context.hasResults) {
      const ctx = contextData.context;
      
      // Format date for readability
      const reportDate = ctx.report?.testDate || 'unknown date';
      
      // Add lab data context
      systemContent += `\n\nYou have access to the user's lab test results from ${reportDate} from ${ctx.report?.labName || 'a lab'}.`;
      
      // Add biomarker information
      if (ctx.biomarkers) {
        systemContent += `\n\nThe user has ${ctx.biomarkers.total} biomarkers tested, with ${ctx.biomarkers.abnormal} abnormal results.`;
        
        // Add abnormal biomarkers if any
        if (ctx.biomarkers.abnormal > 0) {
          systemContent += "\n\nAbnormal biomarkers:";
          
          Object.entries(ctx.biomarkers.byCategory).forEach(([category, biomarkers]) => {
            const abnormalInCategory = biomarkers.filter((b: any) => !b.in_range);
            
            if (abnormalInCategory.length > 0) {
              systemContent += `\n- ${category}: `;
              abnormalInCategory.forEach((b: any, i: number) => {
                systemContent += `${b.name} (${b.value} ${b.unit}, ref: ${b.reference_range})`;
                if (i < abnormalInCategory.length - 1) systemContent += ", ";
              });
            }
          });
        }
      }
      
      // Add health survey data if available
      if (ctx.survey) {
        systemContent += `\n\nThe user completed a health survey on ${ctx.survey.completedDate}.`;
        
        if (ctx.survey.data) {
          // Add symptoms
          if (ctx.survey.data.symptoms && ctx.survey.data.symptoms.length > 0) {
            systemContent += `\n- Reported symptoms: ${ctx.survey.data.symptoms.join(", ")}`;
          }
          
          // Add other metrics
          if (ctx.survey.data.sleepQuality !== undefined) {
            systemContent += `\n- Sleep quality: ${ctx.survey.data.sleepQuality}/10`;
          }
          
          if (ctx.survey.data.stressLevel !== undefined) {
            systemContent += `\n- Stress level: ${ctx.survey.data.stressLevel}/10`;
          }
          
          if (ctx.survey.data.exerciseFrequency !== undefined) {
            systemContent += `\n- Exercise frequency: ${ctx.survey.data.exerciseFrequency} days/week`;
          }
        }
      }
      
      // Add health score if available
      if (ctx.healthScore !== null) {
        systemContent += `\n\nThe user's health score is ${ctx.healthScore}/100.`;
      }
      
      // Instructions for the AI on how to use this data
      systemContent += "\n\nUse this information to provide personalized health insights and recommendations. When discussing biomarkers, explain their significance in user-friendly terms. If asked about results that aren't in the provided data, clarify that you don't have that information.";
    }
    
    // If we failed to get context data, provide emergency test data
    if ((!contextData || !contextData.context || !contextData.context.hasResults) && contextId) {
      console.log("EMERGENCY FALLBACK: Using test context data since real data couldn't be fetched");
      
      // Sample test data to verify our AI prompt approach works
      systemContent = `You are RuneHealth, a helpful AI health assistant that provides information about health and wellness. Keep responses brief and direct.

You have access to the user's lab test results from May 15, 2023 from LabCorp.

The user has 35 biomarkers tested, with 3 abnormal results.

Abnormal biomarkers:
- Lipids: Cholesterol (240 mg/dL, ref: <200 mg/dL), LDL (155 mg/dL, ref: <100 mg/dL)
- Minerals: Vitamin D (18 ng/mL, ref: 30-100 ng/mL)

The user completed a health survey on June 1, 2023.
- Reported symptoms: Fatigue, Joint pain
- Sleep quality: 5/10
- Stress level: 7/10
- Exercise frequency: 2 days/week

The user's health score is 75/100.

Use this information to provide personalized health insights and recommendations. When discussing biomarkers, explain their significance in user-friendly terms. If asked about results that aren't in the provided data, clarify that you don't have that information.

IMPORTANT NOTE: THIS IS SAMPLE TEST DATA - please state at the beginning of your first response that you're using test data only.`;
    }
    
    // System message with full context
    const systemMessage = {
      role: "system",
      content: systemContent
    };
    
    // Log system message length and preview
    console.log("System message length:", systemContent.length);
    console.log("System message preview:", systemContent.substring(0, 200) + "...");
    
    console.log(`Processing request with model: ${model}`);
    console.log(`Message count: ${messages.length}`);
    
    // Basic validation
    if (!messages || !Array.isArray(messages)) {
      console.error("Invalid messages format");
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }
    
    // Use environment variable API key (reliable approach)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    console.log("Calling OpenAI API...");
    
    // Create full messages array with system message
    const fullMessages = [
      systemMessage, 
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ];
    
    // Use NON-STREAMING approach for maximum reliability
    console.log("Using non-streaming OpenAI API call for reliability");
    const response = await openai.chat.completions.create({
      model: model,
      messages: fullMessages,
      stream: false,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const assistantContent = response.choices[0]?.message?.content || "";
    
    // Create a message in the format expected by the AI SDK
    const message = {
      id: requestId,
      role: "assistant",
      content: assistantContent,
      createdAt: new Date().toISOString()
    };
    
    console.log("Got OpenAI response, returning to client");
    
    // Return as a simple JSON response
    return NextResponse.json(message);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: String(error) },
      { status: 500 }
    );
  }
}

