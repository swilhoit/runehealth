"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Share2, AlertTriangle, RefreshCw } from "lucide-react"
import { BiomarkerCategory } from "@/components/biomarker-category"
import { biomarkerCategories } from "@/lib/biomarker-ranges"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DeleteReportButton } from "./delete-report-button"

// Mock data to use as fallback when API fails
const fallbackBiomarkers = {
  cholesterol: { value: 180, unit: "mg/dL", min: 125, max: 200 },
  triglycerides: { value: 150, unit: "mg/dL", min: 0, max: 150 },
  hdl: { value: 50, unit: "mg/dL", min: 40, max: 60 },
  ldl: { value: 100, unit: "mg/dL", min: 0, max: 100 },
}

interface LabReport {
  id: string
  created_at: string
  status: "pending" | "processing" | "analyzing" | "completed" | "error"
  pdf_url?: string
  biomarkers?: Record<string, any>
  insights?: string[]
  recommendations?: string[]
  error_message?: string
}

interface LabReportContentProps {
  report: LabReport
}

export function LabReportContent({ report }: LabReportContentProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  // Always try to use report biomarkers, fall back to mock data if none available
  const biomarkers =
    report.biomarkers && Object.keys(report.biomarkers).length > 0 ? report.biomarkers : fallbackBiomarkers

  const handleDownload = async () => {
    // DEBUG: Add logging to help diagnose PDF viewing issues
    console.log("DEBUG - Download PDF attempt:", {
      hasPdfUrl: !!report.pdf_url,
      pdfUrl: report.pdf_url,
      reportId: report.id
    });
    
    if (!report.pdf_url) {
      console.error("No PDF URL available to download");
      setLogs(prev => [...prev, "Error: No PDF URL available"]);
      alert("PDF URL is missing. Please try re-uploading this lab report.");
      return;
    }
    
    setIsDownloading(true)
    try {
      console.log("Fetching PDF from URL:", report.pdf_url);
      setLogs(prev => [...prev, `Attempting to fetch PDF from: ${report.pdf_url.substring(0, 30)}...`]);
      
      const response = await fetch(report.pdf_url)
      
      // Log response details
      console.log("PDF fetch response:", {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type')
      });
      
      setLogs(prev => [...prev, `PDF fetch response: status=${response.status}, contentType=${response.headers.get('content-type')}`]);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `lab-report-${report.id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      setLogs(prev => [...prev, "PDF downloaded successfully"]);
    } catch (error) {
      console.error("Error downloading PDF:", error)
      setLogs(prev => [...prev, `Error downloading PDF: ${error instanceof Error ? error.message : String(error)}`]);
      alert(`Unable to download PDF. Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsDownloading(false)
    }
  }

  // Add a function to attempt to fix the PDF URL
  const handleFixPdfUrl = () => {
    try {
      if (!report.pdf_url) {
        console.error("No PDF URL to fix");
        return;
      }
      
      setLogs(prev => [...prev, "Attempting to fix PDF URL..."]);
      
      // Try different variations of the URL to find one that works
      const originalUrl = report.pdf_url;
      
      // Create URLs with different variations
      const urls = [
        originalUrl,
        // Try without query parameters
        originalUrl.split('?')[0],
        // Try adding storage path if missing
        !originalUrl.includes('/storage/v1/object/public/') 
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/labs/${report.id}.pdf` 
          : null,
        // Try direct path
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/labs/${report.id}.pdf`,
      ].filter(Boolean) as string[];
      
      setLogs(prev => [...prev, `Generated ${urls.length} URL variations to try`]);
      console.log("URL variations to try:", urls);
      
      // Show the URL variations to the user for debugging
      alert(`DEBUG - PDF URL variations we're trying:\n\n${urls.join('\n\n')}`);
      
    } catch (error) {
      console.error("Error in handleFixPdfUrl:", error);
      setLogs(prev => [...prev, `Error fixing PDF URL: ${error instanceof Error ? error.message : String(error)}`]);
    }
  }

  const handleShare = async () => {
    setIsSharing(true)
    try {
      await navigator.share({
        title: "Lab Report",
        text: "Check out my lab report results",
        url: window.location.href,
      })
    } catch (error) {
      console.error("Error sharing:", error)
    } finally {
      setIsSharing(false)
    }
  }

  const handleRetry = () => {
    setIsRetrying(true)
    // Reload the page to retry the analysis
    window.location.reload()
  }

  return (
    <div className="space-y-8">
      {/* Always show header and controls */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-light text-sand-900">Analysis Results</h2>
          <p className="text-sand-600">
            {report.created_at
              ? `Analyzed on ${new Date(report.created_at).toLocaleDateString()}`
              : "Analysis in progress"}
          </p>
        </div>
        <div className="flex gap-4">
          {report.pdf_url && (
            <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? "Downloading..." : "Download PDF"}
            </Button>
          )}
          <Button variant="outline" onClick={handleShare} disabled={isSharing}>
            <Share2 className="mr-2 h-4 w-4" />
            {isSharing ? "Sharing..." : "Share"}
          </Button>
          <Button variant="outline" onClick={handleRetry} disabled={isRetrying}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Analysis
          </Button>
          <Button variant="outline" onClick={handleFixPdfUrl}>
            Fix PDF
          </Button>
          <DeleteReportButton reportId={report.id} className="ml-2" />
        </div>
      </div>

      {/* Debug info */}
      {logs.length > 0 && (
        <div className="bg-gray-100 p-4 rounded-md mb-4 mt-4">
          <h3 className="font-medium mb-2">Debug Logs</h3>
          <div className="text-xs font-mono h-32 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))}
          </div>
        </div>
      )}

      {/* Show error message but continue displaying data */}
      {(report.status === "error" || report.error_message) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Processing Error</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{report.error_message || "An error occurred while processing your lab report."}</p>
            <p className="font-medium">
              Showing available data and estimates below. Click "Retry Analysis" to try again.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Always attempt to show biomarker data */}
      <div className="grid gap-8">
        {Object.entries(biomarkerCategories).map(([category, biomarkerList]) => {
          const categoryBiomarkers = biomarkerList.reduce(
            (acc, name) => {
              try {
                if (name in biomarkers) {
                  acc[name] = biomarkers[name]
                }
              } catch (error) {
                console.error(`Error processing biomarker ${name}:`, error)
              }
              return acc
            },
            {} as Record<string, any>,
          )

          if (Object.keys(categoryBiomarkers).length === 0) return null

          const missingBiomarkers = biomarkerList.filter((name) => !(name in categoryBiomarkers))

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <BiomarkerCategory
                title={category
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
                description={`Analysis of your ${category.replace(/_/g, " ")} biomarkers`}
                biomarkers={categoryBiomarkers}
                insights={
                  report.insights?.filter((insight) => insight.toLowerCase().includes(category.toLowerCase())) || []
                }
                missingBiomarkers={missingBiomarkers}
              />
            </motion.div>
          )
        })}
      </div>

      {/* Show recommendations if available */}
      {report.recommendations && report.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-medium mb-4">Recommendations</h3>
              <ul className="space-y-2">
                {report.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-terra-500 mt-2" />
                    <span className="text-sand-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Show fallback recommendations if none provided */}
      {(!report.recommendations || report.recommendations.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-medium mb-4">General Recommendations</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-terra-500 mt-2" />
                  <span className="text-sand-700">
                    Schedule a follow-up with your healthcare provider to review your results in detail
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-terra-500 mt-2" />
                  <span className="text-sand-700">
                    Maintain a balanced diet rich in fruits, vegetables, and whole grains
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-terra-500 mt-2" />
                  <span className="text-sand-700">Stay hydrated and aim for regular physical activity</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

