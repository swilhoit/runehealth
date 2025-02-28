import { Suspense } from "react"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { notFound } from "next/navigation"
import { LabReportContent } from "@/components/lab-report-content"
import { Card } from "@/components/ui/card"

interface PageProps {
  params: {
    id: string
  }
}

export default async function LabReportPage({ params }: PageProps) {
  const supabase = createServerComponentClient({ cookies })

  // Get the lab report with biomarker results and join with biomarker definitions
  const { data: report, error } = await supabase
    .from("lab_reports")
    .select(`
      *,
      biomarker_results (
        id,
        value,
        unit,
        reference_range_min,
        reference_range_max,
        optimal_range_min,
        optimal_range_max,
        computed_status,
        biomarker:biomarker_definitions (
          code,
          name,
          description,
          category
        )
      )
    `)
    .eq("id", params.id)
    .single()

  if (error) {
    console.error("Error fetching lab report:", error)
  }

  if (!report) {
    notFound()
  }

  // Transform biomarker results into the expected format
  const biomarkers = report.biomarker_results?.reduce((acc: Record<string, any>, result: any) => {
    if (result.biomarker?.code) {
      acc[result.biomarker.code] = {
        value: result.value,
        unit: result.unit,
        min: result.reference_range_min,
        max: result.reference_range_max,
        optimal_min: result.optimal_range_min,
        optimal_max: result.optimal_range_max,
        status: result.computed_status,
        name: result.biomarker.name,
        description: result.biomarker.description,
        category: result.biomarker.category,
      }
    }
    return acc
  }, {})

  // Add the transformed biomarkers back to the report
  const transformedReport = {
    ...report,
    biomarkers: biomarkers || {},
    // Add default insights if none exist
    insights: report.insights || [
      "Your cholesterol levels are within normal range",
      "Vitamin D levels could be optimized",
      "Blood sugar control is good",
    ],
    // Add default recommendations if none exist
    recommendations: report.recommendations || [
      "Consider vitamin D supplementation",
      "Maintain current diet and exercise routine",
      "Schedule follow-up in 6 months",
    ],
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-thin text-sand-900 mb-2">Lab Report</h1>
        <p className="text-sand-600 font-light">Uploaded on {new Date(report.created_at).toLocaleDateString()}</p>
      </div>

      <Suspense
        fallback={
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-terra-600 border-t-transparent" />
            </div>
          </Card>
        }
      >
        <LabReportContent report={transformedReport} />
      </Suspense>
    </div>
  )
}

