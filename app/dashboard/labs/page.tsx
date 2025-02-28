"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FlaskRoundIcon as Flask, Upload, FileText, Loader2, Bug, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

interface LabReport {
  id: string
  created_at: string
  status: "pending" | "processing" | "completed" | "error"
  error_message?: string | null
  pdf_url?: string
  file_path?: string
  [key: string]: any // Allow for other properties
}

export default function LabsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<LabReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [expandedReports, setExpandedReports] = useState<{[key: string]: boolean}>({})
  const supabase = createClientComponentClient({
    options: {
      global: {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    },
  })

  useEffect(() => {
    async function fetchLabReports() {
      try {
        console.log("Fetching lab reports...");
        const { data, error } = await supabase.from("lab_reports").select("*").order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching lab reports:", error);
          throw error;
        }

        console.log(`Fetched ${data?.length || 0} lab reports`);
        
        // Add more detailed logging about each report
        if (data && data.length > 0) {
          data.forEach(report => {
            console.log(`Report ${report.id}:`, {
              status: report.status,
              hasPdfUrl: !!report.pdf_url,
              pdfUrl: report.pdf_url,
              created: new Date(report.created_at).toLocaleString()
            });
          });
        }

        setReports(data || [])
      } catch (err) {
        console.error("Error fetching lab reports:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch lab reports")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLabReports()
  }, [supabase])

  const handleUploadClick = () => {
    router.push("/dashboard/upload-labs")
  }

  const handleViewReport = (report: LabReport) => {
    // Add detailed logging when a report is clicked
    console.log("Viewing lab report:", {
      id: report.id,
      status: report.status,
      created: new Date(report.created_at).toLocaleString(),
      hasPdfUrl: !!report.pdf_url,
      pdfUrl: report.pdf_url,
      filePath: report.file_path
    });
    
    router.push(`/dashboard/labs/${report.id}`)
  }

  const toggleReportExpand = (reportId: string) => {
    setExpandedReports(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "processing":
        return "text-blue-600"
      case "error":
        return "text-red-600"
      default:
        return "text-sand-600"
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-thin text-sand-900 mb-2">Lab Results</h1>
          <p className="text-sand-600 font-light">Upload and analyze your blood test results</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setShowDebug(!showDebug)}
            title="Toggle debugging information"
          >
            <Bug className="h-4 w-4" />
          </Button>
          <Button className="bg-terra-600 hover:bg-terra-700 text-white" onClick={handleUploadClick}>
            <Upload className="w-4 h-4 mr-2" />
            Upload New Results
          </Button>
        </div>
      </div>

      {showDebug && (
        <Card className="bg-gray-100 border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-light text-gray-700">
              <Bug className="h-5 w-5" />
              Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-mono">
            <div>Total Reports: {reports.length}</div>
            <div>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set"}</div>
            <div>Has Supabase Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Yes" : "No"}</div>
            <div>Current Path: {typeof window !== 'undefined' ? window.location.pathname : "Unknown"}</div>
          </CardContent>
        </Card>
      )}

      <Suspense fallback={<LoadingState />}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="bg-white/80 backdrop-blur-sm border-sand-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-light">
                <Flask className="h-5 w-5 text-terra-600" />
                Lab Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingState />
              ) : error ? (
                <ErrorState message={error} />
              ) : reports.length === 0 ? (
                <EmptyState onUpload={handleUploadClick} />
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex flex-col p-4 rounded-lg border border-sand-200 hover:bg-sand-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <FileText className="h-8 w-8 text-sand-400" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sand-900">Blood Test Results</p>
                            <span className={`text-sm ${getStatusColor(report.status)}`}>
                              • {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-sand-600">
                            Uploaded {format(new Date(report.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                          {report.error_message && <p className="text-sm text-red-600 mt-1">{report.error_message}</p>}
                        </div>
                        <div className="flex gap-2">
                          {showDebug && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-auto"
                              onClick={() => toggleReportExpand(report.id)}
                            >
                              {expandedReports[report.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto"
                            onClick={() => {
                              console.log("Viewing lab report:", report.id, "Status:", report.status);
                              handleViewReport(report);
                            }}
                          >
                            {report.status === "processing" ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                View Processing
                              </>
                            ) : (
                              "View"
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Debug details for the report */}
                      {showDebug && expandedReports[report.id] && (
                        <div className="mt-4 p-3 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
                          <div className="mb-2"><strong>Report ID:</strong> {report.id}</div>
                          <div className="mb-2"><strong>Status:</strong> {report.status}</div>
                          <div className="mb-2"><strong>Has PDF URL:</strong> {report.pdf_url ? "Yes" : "No"}</div>
                          {report.pdf_url && (
                            <div className="mb-2 break-all">
                              <strong>PDF URL:</strong> <span className="text-blue-600">{report.pdf_url}</span>
                            </div>
                          )}
                          {report.file_path && (
                            <div className="mb-2">
                              <strong>File Path:</strong> {report.file_path}
                            </div>
                          )}
                          <details>
                            <summary className="cursor-pointer">Full Report Data</summary>
                            <pre className="mt-2 p-2 bg-gray-200 rounded overflow-x-auto">
                              {JSON.stringify(report, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Suspense>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-terra-600" />
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="text-center py-8">
      <p className="text-red-600">{message}</p>
    </div>
  )
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="text-center py-8">
      <FileText className="h-12 w-12 mx-auto text-sand-400 mb-4" />
      <p className="text-sand-600 mb-4">No lab reports uploaded yet</p>
      <Button onClick={onUpload} variant="outline">
        <Upload className="w-4 h-4 mr-2" />
        Upload Your First Report
      </Button>
    </div>
  )
}

