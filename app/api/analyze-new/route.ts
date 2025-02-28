import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/lib/supabase/database.types";

// Helper function to add CORS headers
function corsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Helper function for structured error responses with additional information
function errorResponse(message: string, details: string = "", status: number = 500, reportId?: string, additionalInfo?: Record<string, any>) {
  console.error(`Error: ${message}`, details);
  return corsHeaders(NextResponse.json(
    { 
      error: message,
      details,
      reportId,
      ...additionalInfo
    },
    { status }
  ));
}

// Helper function to suggest SQL execution
function dbSchemaErrorResponse(reportId: string) {
  return errorResponse(
    "Database schema error", 
    "The database tables are either missing or have an incorrect schema. Please run the SQL setup script.",
    500,
    reportId,
    {
      suggestion: "Run the SQL script in lib/supabase/schema.sql in your Supabase SQL editor.",
      schema_url: "https://github.com/your-repo/runehealth/blob/main/lib/supabase/schema.sql"
    }
  );
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  console.log("OPTIONS request received");
  return corsHeaders(NextResponse.json({}, { status: 200 }));
}

export async function POST(request: Request) {
  console.log("POST request received to /api/analyze-new");
  console.log("Request URL:", request.url);
  
  // Generate a unique ID for the report at the beginning
  const reportId = uuidv4();
  console.log("Generated report ID:", reportId);
  
  try {
    // Create a server-side Supabase client early
    let serverSupabase;
    try {
      const cookieStore = cookies();
      serverSupabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
      console.log("Created server-side Supabase client");
    } catch (supabaseError) {
      return errorResponse(
        "Failed to initialize database connection", 
        supabaseError instanceof Error ? supabaseError.message : "Unknown error", 
        500, 
        reportId
      );
    }
    
    // Check if the request is a FormData request
    const contentType = request.headers.get("content-type") || "";
    console.log("Request content type:", contentType);
    
    if (!contentType.includes("multipart/form-data")) {
      return errorResponse(
        "Invalid content type. Expected multipart/form-data", 
        `Received: ${contentType}`, 
        400, 
        reportId
      );
    }

    // Parse the form data
    let formData;
    try {
      formData = await request.formData();
      console.log("Parsed form data keys:", [...formData.keys()]);
    } catch (formError) {
      return errorResponse(
        "Failed to parse form data", 
        formError instanceof Error ? formError.message : "Unknown error", 
        400, 
        reportId
      );
    }
    
    const file = formData.get("file") as File;
    
    if (!file) {
      return errorResponse("No file provided", "", 400, reportId);
    }
    
    console.log("File received:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });
    
    // Check if the file is a PDF
    if (file.type !== "application/pdf") {
      return errorResponse(
        "Invalid file type. Expected PDF", 
        `Received: ${file.type}`, 
        400, 
        reportId
      );
    }
    
    // Get the user ID from the form data
    const userId = formData.get("userId") as string;
    if (!userId) {
      return errorResponse("No user ID found in the request", "", 400, reportId);
    }
    
    console.log("User ID:", userId);
    
    // Return success for now
    return corsHeaders(NextResponse.json({
      reportId,
      message: "Lab report processed successfully",
      processingSteps: [
        { name: "Upload", status: "completed", details: "PDF uploaded successfully" }
      ]
    }));
    
  } catch (error) {
    return errorResponse(
      "Failed to process the lab report", 
      error instanceof Error ? error.message : "Unknown error", 
      500, 
      reportId
    );
  }
}
