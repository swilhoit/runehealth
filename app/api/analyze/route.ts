import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { Logger } from "@/lib/logger"
import OpenAI from "openai"
import { findBiomarkerCode } from "@/lib/biomarker-utils"
import { extractTextFromPDF, analyzePDFText, validatePDF } from "@/lib/pdf-extraction"

const logger = new Logger("api/analyze")

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Helper function to add CORS headers
function corsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

// Enhanced debug logging
function debugLog(message: string, data?: any) {
  console.debug(`[API DEBUG] ${message}`, data)
  logger.debug(message, data)
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: Request) {
  debugLog("OPTIONS request received", {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries([...request.headers.entries()])
  })
  return corsHeaders(NextResponse.json({}, { status: 200 }))
}

export async function POST(request: Request) {
  const operation = logger.startOperation("analyze-lab-report")
  const requestId = logger.requestId
  let reportId: string | null = null
  let file: File | null = null

  debugLog("POST request received", {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries([...request.headers.entries()])
  })

  try {
    const supabase = createRouteHandlerClient({ cookies })
    debugLog("Supabase client created", {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })

    // Verify authentication
    debugLog("Verifying authentication")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    debugLog("Auth result", { 
      hasUser: !!user, 
      userId: user?.id,
      authError: authError ? { message: authError.message } : null 
    })

    if (authError || !user) {
      debugLog("Authentication failed", { authError })
      return corsHeaders(NextResponse.json(
        {
          success: false,
          error: "Authentication required",
          requestId,
        },
        { status: 401 }
      ))
    }

    logger.setUserId(user.id)
    logger.info("Processing upload request", { userId: user.id })

    // Get form data
    debugLog("Parsing form data")
    const formData = await request.formData()
    debugLog("Form data entries", {
      keys: [...formData.keys()],
      hasFile: formData.has("file")
    })
    
    file = formData.get("file") as File

    if (!file) {
      debugLog("No file provided in form data")
      throw new Error("No file provided")
    }

    logger.debug("Validating file", {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Validate file type and size
    const validTypes = ["application/pdf", "application/x-pdf"]
    if (!validTypes.includes(file.type.toLowerCase())) {
      debugLog("Invalid file type", { type: file.type, validTypes })
      throw new Error(`Invalid file type: ${file.type}. Only PDF files are allowed.`)
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      debugLog("File too large", { size: file.size, maxSize })
      throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 10MB limit`)
    }

    // Read file buffer
    debugLog("Reading file buffer")
    const fileBuffer = await file.arrayBuffer()
    debugLog("File buffer read", { bufferSize: fileBuffer.byteLength })

    // Validate PDF structure
    debugLog("Validating PDF structure")
    const isValidPDF = await validatePDF(fileBuffer, logger)
    debugLog("PDF validation result", { isValid: isValidPDF })
    
    if (!isValidPDF) {
      throw new Error("Invalid or corrupted PDF file")
    }

    // Create initial lab report record
    debugLog("Creating lab report record", { userId: user.id })
    const { data: report, error: reportError } = await supabase
      .from("lab_reports")
      .insert({
        user_id: user.id,
        status: "processing",
        report_date: new Date().toISOString(),
        test_date: new Date().toISOString(),
      })
      .select()
      .single()

    debugLog("Lab report creation result", { 
      success: !!report && !reportError,
      reportId: report?.id,
      error: reportError ? reportError.message : null
    })

    if (reportError || !report) {
      throw reportError || new Error("Failed to create lab report")
    }

    reportId = report.id
    logger.info("Lab report record created", { reportId })

    // Add error handling for PDF extraction
    try {
      // Extract text from PDF
      debugLog("Extracting text from PDF")
      const extractedText = await extractTextFromPDF(fileBuffer, logger)

      if (!extractedText || extractedText.trim().length === 0) {
        debugLog("No text extracted from PDF")
        throw new Error("No text could be extracted from the PDF")
      }

      debugLog("Text extracted successfully", {
        textLength: extractedText.length,
        preview: extractedText.substring(0, 200),
      })

      // Update report status to analyzing
      debugLog("Updating report status to analyzing", { reportId })
      await supabase
        .from("lab_reports")
        .update({
          status: "analyzing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId)

      // Continue with rest of analysis...
      // First pass: Extract biomarkers using pattern matching
      debugLog("Analyzing PDF text for biomarkers")
      const extractedBiomarkers = await analyzePDFText(extractedText, logger)
      debugLog("Biomarkers extracted", { count: extractedBiomarkers.length })

      // Second pass: Use OpenAI to analyze the text and extract additional information
      debugLog("Starting OpenAI analysis")
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a medical lab report analyzer. Extract biomarker values and generate insights from the following lab report text. 
          Focus on these biomarkers: cholesterol, triglycerides, hdl, ldl, glucose, vitamin D, and any other relevant values.
          Return a JSON object with biomarkers (including values and units), insights, and recommendations.`,
          },
          {
            role: "user",
            content: extractedText,
          },
        ],
        response_format: { type: "json_object" },
      })

      const aiAnalysis = JSON.parse(completion.choices[0].message.content || "{}")
      debugLog("OpenAI analysis complete", { 
        hasBiomarkers: !!aiAnalysis.biomarkers,
        hasInsights: !!aiAnalysis.insights,
        hasRecommendations: !!aiAnalysis.recommendations
      })

      // Combine pattern-matched and AI-extracted biomarkers
      const allBiomarkers = [...extractedBiomarkers]
      if (aiAnalysis.biomarkers) {
        for (const [name, data] of Object.entries(aiAnalysis.biomarkers)) {
          const code = findBiomarkerCode(name)
          if (code && !allBiomarkers.some((b) => b.code === code)) {
            allBiomarkers.push({
              code,
              value: (data as any).value,
              unit: (data as any).unit,
            })
          }
        }
      }
      debugLog("Combined biomarkers", { count: allBiomarkers.length })

      // Get biomarker definitions
      debugLog("Fetching biomarker definitions")
      const { data: biomarkerDefs, error: defsError } = await supabase.from("biomarker_definitions").select("*")
      
      if (defsError) {
        debugLog("Error fetching biomarker definitions", { error: defsError.message })
      } else {
        debugLog("Biomarker definitions fetched", { count: biomarkerDefs?.length || 0 })
      }

      // Insert biomarker results
      debugLog("Inserting biomarker results")
      let insertedCount = 0
      for (const biomarker of allBiomarkers) {
        const definition = biomarkerDefs?.find((def) => findBiomarkerCode(def.code) === biomarker.code)

        if (definition) {
          const { error: insertError } = await supabase.from("biomarker_results").insert({
            report_id: report.id,
            biomarker_id: definition.id,
            value: biomarker.value,
            unit: biomarker.unit,
            reference_range_min: definition.min_value,
            reference_range_max: definition.max_value,
            optimal_range_min: definition.optimal_min,
            optimal_range_max: definition.optimal_max,
          })
          
          if (!insertError) {
            insertedCount++
          } else {
            debugLog("Error inserting biomarker result", { 
              biomarker: biomarker.code, 
              error: insertError.message 
            })
          }
        }
      }
      debugLog("Biomarker results inserted", { count: insertedCount })

      // Update report with insights and status
      debugLog("Updating report with insights and status", { reportId })
      const { error: updateError } = await supabase
        .from("lab_reports")
        .update({
          status: "completed",
          insights: aiAnalysis.insights || [],
          recommendations: aiAnalysis.recommendations || [],
          updated_at: new Date().toISOString(),
        })
        .eq("id", report.id)
        
      if (updateError) {
        debugLog("Error updating report", { error: updateError.message })
      }

      logger.info("Lab report analysis completed", {
        reportId: report.id,
        biomarkerCount: allBiomarkers.length,
      })

      operation.end({ status: "success" })
      
      const response = corsHeaders(NextResponse.json({
        success: true,
        reportId: report.id,
      }))
      
      debugLog("Sending successful response", { 
        reportId: report.id,
        headers: Object.fromEntries([...response.headers.entries()])
      })
      
      return response
    } catch (error) {
      logger.error("PDF extraction failed", error)
      debugLog("PDF extraction failed", { 
        error: error instanceof Error ? error.message : String(error) 
      })

      // Update report status to error
      if (reportId) {
        debugLog("Updating report status to error", { reportId })
        await supabase
          .from("lab_reports")
          .update({
            status: "error",
            error_message: `PDF extraction failed: ${error instanceof Error ? error.message : String(error)}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", reportId)
      }

      throw error
    }
  } catch (error) {
    operation.fail(error)
    logger.error("Failed to analyze lab report", error)
    debugLog("Analysis failed", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })

    // Update report status if we have a report ID
    if (reportId) {
      const supabase = createRouteHandlerClient({ cookies })
      await supabase
        .from("lab_reports")
        .update({
          status: "error",
          error_message: error instanceof Error ? error.message : String(error),
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId)
    }

    const response = corsHeaders(NextResponse.json(
      {
        success: false,
        error: "Failed to analyze lab report",
        details: error instanceof Error ? error.message : String(error),
        requestId,
      },
      { status: 500 },
    ))
    
    debugLog("Sending error response", { 
      status: 500,
      error: error instanceof Error ? error.message : String(error),
      headers: Object.fromEntries([...response.headers.entries()])
    })
    
    return response
  }
}

