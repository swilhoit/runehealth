import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  console.log("Received POST request to /api/upload")
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("No file uploaded")
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    console.log("File received:", file.name)

    // For now, we'll just return a mock analysis
    // In a real-world scenario, you'd process the PDF and use OpenAI here
    const mockAnalysis = {
      biomarkers: {
        cholesterol: 180,
        triglycerides: 150,
        hdl: 50,
        ldl: 100,
        glucose: 90,
        vitaminD: 30,
      },
      insights: [
        "Your cholesterol levels are within the normal range.",
        "Your triglycerides are slightly elevated. Consider reducing your intake of sugary and fatty foods.",
        "Your HDL (good cholesterol) is at a good level.",
        "Your LDL (bad cholesterol) is at an acceptable level, but there's room for improvement.",
        "Your glucose levels are normal, indicating good blood sugar control.",
        "Your Vitamin D levels are sufficient, but could be optimized further.",
      ],
      recommendations: [
        "Maintain your current diet and exercise routine to keep cholesterol levels in check.",
        "Increase your intake of omega-3 fatty acids to help lower triglycerides.",
        "Consider adding more fiber to your diet to help lower LDL cholesterol.",
        "Ensure regular sun exposure or consider Vitamin D supplementation to optimize levels.",
        "Schedule a follow-up with your healthcare provider to discuss these results in detail.",
      ],
    }

    console.log("Sending mock analysis")
    return NextResponse.json(mockAnalysis)
  } catch (error) {
    console.error("Error in upload API route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred while processing the file.", details: String(error) },
      { status: 500 },
    )
  }
}

