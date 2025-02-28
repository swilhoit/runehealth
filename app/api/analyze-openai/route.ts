import type { NextRequest } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import OpenAI from "openai"

export const maxDuration = 60 // 60 seconds maximum

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function logToConsole(message: string, data?: any) {
  console.log(`[OpenAI Analysis] ${message}`)
  if (data) {
    console.log(JSON.stringify(data, null, 2))
  }
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { pdfText, reportId } = await request.json()

    if (!pdfText || !reportId) {
      return new Response(JSON.stringify({ error: "Missing required data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    logToConsole("Sending request to OpenAI with text length:", pdfText.length)

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert biomedical analyst. Analyze the provided lab report text and extract biomarker values, ensuring to convert all values to numbers. Provide insights, recommendations, and a summary based on the analysis. Your response must be a valid JSON object with the following structure:
{
  "biomarkers": {
    "cholesterol": {"value": 0, "unit": "", "min": 0, "max": 0},
    "triglycerides": {"value": 0, "unit": "", "min": 0, "max": 0},
    "hdl": {"value": 0, "unit": "", "min": 0, "max": 0},
    "ldl": {"value": 0, "unit": "", "min": 0, "max": 0},
    "glucose": {"value": 0, "unit": "", "min": 0, "max": 0},
    "vitaminD": {"value": 0, "unit": "", "min": 0, "max": 0}
  },
  "insights": [""],
  "recommendations": [""],
  "summary": ""
}`,
        },
        { role: "user", content: pdfText },
      ],
      temperature: 0.7,
    })

    const content = completion.choices[0].message.content

    if (!content) {
      throw new Error("No content returned from OpenAI")
    }

    logToConsole("Raw OpenAI response:", content)

    const analysisJson = JSON.parse(content)

    // Update the lab report with the analysis results
    const { error: updateError } = await supabase
      .from("lab_reports")
      .update({
        biomarkers: analysisJson.biomarkers,
        insights: analysisJson.insights,
        recommendations: analysisJson.recommendations,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisJson,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error in analyze-openai API route:", error)
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred while analyzing the blood test results.",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

