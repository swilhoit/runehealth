"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { BiomarkerCategory } from "@/components/biomarker-category"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Beaker, Activity, Heart, Brain, Dna, FileText } from "lucide-react"
import { biomarkerCategories, type BiomarkerData } from "@/lib/biomarker-ranges"

interface Analysis {
  biomarkers: Record<string, BiomarkerData>
  categoryInsights: Record<string, string[]>
  recommendations: string[]
  summary: string[]
}

const categoryConfig = {
  lipidPanel: {
    title: "Lipid Panel",
    description: "Cholesterol and related biomarkers",
    icon: Heart,
  },
  bloodCells: {
    title: "Blood Cell Counts",
    description: "Red blood cell measurements",
    icon: Dna,
  },
  metabolic: {
    title: "Metabolic Panel",
    description: "Blood sugar and electrolytes",
    icon: Activity,
  },
  liver: {
    title: "Liver Function",
    description: "Liver health indicators",
    icon: Beaker,
  },
  hormones: {
    title: "Hormones",
    description: "Hormone levels and vitamin D",
    icon: Brain,
  },
  cardiovascular: {
    title: "Cardiovascular",
    description: "Heart health indicators",
    icon: Heart,
  },
}

export function DashboardContent() {
  const searchParams = useSearchParams()
  const [analysisData, setAnalysisData] = useState<Analysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const data = searchParams.get("data")
    if (data) {
      try {
        const parsedData = JSON.parse(data) as Analysis
        if (!parsedData.biomarkers || typeof parsedData.biomarkers !== "object") {
          throw new Error("Invalid or missing biomarkers data")
        }
        // Ensure summary is an array
        if (typeof parsedData.summary === "string") {
          parsedData.summary = [parsedData.summary]
        }
        setAnalysisData(parsedData)
      } catch (e) {
        console.error("Error parsing analysis data:", e)
        setError("Failed to load analysis data. Please try uploading the file again.")
      }
    } else {
      setError("No analysis data found. Please upload a file to analyze.")
    }
  }, [searchParams])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!analysisData) {
    return <div>Loading analysis data...</div>
  }

  return (
    <>
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* AI Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-sand-600" />
              <CardTitle>AI Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {analysisData.summary.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-sand-600" />
              <CardTitle>Recommendations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {analysisData.recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Object.entries(biomarkerCategories).map(([category, biomarkerList]) => {
          const categoryBiomarkers = biomarkerList.reduce(
            (acc, name) => {
              if (name in analysisData.biomarkers) {
                acc[name] = analysisData.biomarkers[name]
              }
              return acc
            },
            {} as Record<string, BiomarkerData>,
          )

          if (Object.keys(categoryBiomarkers).length === 0) return null

          const config = categoryConfig[category as keyof typeof categoryConfig]

          if (!config) {
            console.warn(`No configuration found for category: ${category}`)
            return null
          }

          return (
            <BiomarkerCategory
              key={category}
              title={config.title}
              description={config.description}
              biomarkers={categoryBiomarkers}
              insights={analysisData.categoryInsights[category] || []}
            />
          )
        })}
      </div>
    </>
  )
}

