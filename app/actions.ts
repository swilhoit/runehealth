"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function uploadPDF(formData: FormData) {
  console.log("Starting uploadPDF function")
  const supabase = createServerSupabaseClient()

  try {
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) throw new Error("Authentication required")

    const file = formData.get("pdf") as File
    if (!file) {
      console.log("No file uploaded")
      return { error: "No file uploaded" }
    }

    console.log("File received:", file.name)

    // Upload file to Supabase Storage
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    const { data: fileData, error: uploadError } = await supabase.storage.from("lab-reports").upload(fileName, file)

    if (uploadError) throw uploadError

    // Create lab report record
    const { data: reportData, error: reportError } = await supabase
      .from("lab_reports")
      .insert({
        user_id: user.id,
        report_date: new Date().toISOString(),
        pdf_url: fileData.path,
        status: "processing",
      })
      .select()
      .single()

    if (reportError) throw reportError

    // Simulate biomarker extraction (replace with actual PDF processing)
    const mockBiomarkers = {
      cholesterol: 158,
      triglycerides: 86,
      hdl: 39,
      ldl: 103,
      glucose: 86,
      vitaminD: 21.1,
    }

    // Get biomarker definitions
    const { data: biomarkerDefs, error: defsError } = await supabase.from("biomarker_definitions").select("*")

    if (defsError) throw defsError

    // Insert biomarker results
    const biomarkerResults = Object.entries(mockBiomarkers)
      .map(([code, value]) => {
        const definition = biomarkerDefs.find((def) => def.code.toLowerCase() === code.toLowerCase())
        if (!definition) return null

        return {
          report_id: reportData.id,
          biomarker_id: definition.id,
          value,
          unit: definition.unit,
        }
      })
      .filter(Boolean)

    const { error: resultsError } = await supabase.from("biomarker_results").insert(biomarkerResults)

    if (resultsError) throw resultsError

    // Generate and store insights
    const insights = [
      {
        report_id: reportData.id,
        category: "lipidPanel" as const,
        insight_type: "observation" as const,
        content: "Your cholesterol levels are within the normal range.",
        priority: 1,
      },
      {
        report_id: reportData.id,
        category: "lipidPanel" as const,
        insight_type: "recommendation" as const,
        content: "Consider increasing HDL through regular exercise and healthy fats in your diet.",
        priority: 2,
      },
    ]

    const { error: insightsError } = await supabase.from("insights").insert(insights)

    if (insightsError) throw insightsError

    // Update report status to completed
    const { error: updateError } = await supabase
      .from("lab_reports")
      .update({ status: "completed" })
      .eq("id", reportData.id)

    if (updateError) throw updateError

    console.log("Redirecting to dashboard")
    revalidatePath("/dashboard")
    redirect(`/dashboard?report=${reportData.id}`)
  } catch (error) {
    console.error("Error in uploadPDF:", error)
    return {
      error: true,
      message: error instanceof Error ? error.message : "An unknown error occurred",
      details: JSON.stringify(error),
    }
  }
}

