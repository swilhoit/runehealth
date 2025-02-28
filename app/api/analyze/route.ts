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

export async function POST(request: Request) {
  const operation = logger.startOperation("analyze-lab-report")
  const requestId = logger.requestId
  let reportId: string | null = null
  let file: File | null = null

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("Authentication required")
    }

    logger.setUserId(user.id)
    logger.info("Processing upload request", { userId: user.id })

    // Get form data
    const formData = await request.formData()
    file = formData.get("file") as File

    if (!file) {
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
      throw new Error(`Invalid file type: ${file.type}. Only PDF files are allowed.`)
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 10MB limit`)
    }

    // Read file buffer
    const fileBuffer = await file.arrayBuffer()

    // Validate PDF structure
    const isValidPDF = await validatePDF(fileBuffer, logger)
    if (!isValidPDF) {
      throw new Error("Invalid or corrupted PDF file")
    }

    // Create initial lab report record
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

    if (reportError || !report) {
      throw reportError || new Error("Failed to create lab report")
    }

    reportId = report.id
    logger.info("Lab report record created", { reportId })

    // Add error handling for PDF extraction
    try {
      // Extract text from PDF
      const extractedText = await extractTextFromPDF(fileBuffer, logger)

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error("No text could be extracted from the PDF")
      }

      logger.debug("Successfully extracted text", {
        textLength: extractedText.length,
        preview: extractedText.substring(0, 200),
      })

      // Update report status to analyzing
      await supabase
        .from("lab_reports")
        .update({
          status: "analyzing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId)

      // Continue with rest of analysis...
      // First pass: Extract biomarkers using pattern matching
      const extractedBiomarkers = await analyzePDFText(extractedText, logger)

      // Second pass: Use OpenAI to analyze the text and extract additional information
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

      // Get biomarker definitions
      const { data: biomarkerDefs } = await supabase.from("biomarker_definitions").select("*")

      // Insert biomarker results
      for (const biomarker of allBiomarkers) {
        const definition = biomarkerDefs?.find((def) => findBiomarkerCode(def.code) === biomarker.code)

        if (definition) {
          await supabase.from("biomarker_results").insert({
            report_id: report.id,
            biomarker_id: definition.id,
            value: biomarker.value,
            unit: biomarker.unit,
            reference_range_min: definition.min_value,
            reference_range_max: definition.max_value,
            optimal_range_min: definition.optimal_min,
            optimal_range_max: definition.optimal_max,
          })
        }
      }

      // Update report with insights and status
      await supabase
        .from("lab_reports")
        .update({
          status: "completed",
          insights: aiAnalysis.insights || [],
          recommendations: aiAnalysis.recommendations || [],
          updated_at: new Date().toISOString(),
        })
        .eq("id", report.id)

      logger.info("Lab report analysis completed", {
        reportId: report.id,
        biomarkerCount: allBiomarkers.length,
      })

      operation.end({ status: "success" })

      return NextResponse.json({
        success: true,
        reportId: report.id,
      })
    } catch (error) {
      logger.error("PDF extraction failed", error)

      // Update report status to error
      if (reportId) {
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

    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze lab report",
        details: error instanceof Error ? error.message : String(error),
        requestId,
      },
      { status: 500 },
    )
  }
}

