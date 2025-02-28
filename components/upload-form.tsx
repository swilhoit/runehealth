"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FaSpinner, FaCheck, FaUpload, FaExclamationTriangle } from "react-icons/fa"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/lib/supabase/database.types"
import { getModelSettings } from "@/lib/ai-utils"

// Debug logging function
function logDebug(message: string, data?: any) {
  const timestamp = new Date().toISOString()
  console.debug(`[Upload Form DEBUG] [${timestamp}] ${message}`, data ? data : "")
}

// Operation logging function
function logOperation(operation: string, status: string, details?: any) {
  const timestamp = new Date().toISOString()
  console.log(`[Upload Form] [${timestamp}] ${operation} - ${status}${details ? `: ${JSON.stringify(details)}` : ""}`)
}

interface ProcessingStep {
  name: string
  status: string
  details?: string
}

export function UploadForm() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()
  
  // Track processing steps
  const [stepsCompleted, setStepsCompleted] = useState({
    upload: false,
    extraction: false,
    analysis: false,
    storage: false,
  })
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      console.log("File selected:", file.name, file.type, file.size)
      setSelectedFile(file)
      
      // Reset progress and steps when a new file is selected
      setUploadProgress(0)
      setStepsCompleted({
        upload: false,
        extraction: false,
        analysis: false,
        storage: false,
      })
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (!selectedFile) {
        toast({
          title: "No file selected",
          description: "Please select a PDF lab report to upload",
          variant: "destructive",
        })
        return
      }
      
      // Validate file type
      if (selectedFile.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file only",
          variant: "destructive",
        })
        return
      }
      
      // Check file size (10MB limit)
      const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        })
        return
      }
      
      setIsUploading(true)
      setCurrentStep("Uploading lab report...")
      setUploadProgress(10)
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error("Authentication error:", userError)
        toast({
          title: "Authentication error",
          description: "Please log in again to upload files",
          variant: "destructive",
        })
        setIsUploading(false)
        return
      }
      
      console.log("Authenticated user:", user.id)
      
      // Get model settings
      const modelSettings = getModelSettings();
      console.log("Using model settings for upload:", {
        provider: modelSettings.provider,
        model: modelSettings.model
      });
      
      // Create form data
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("userId", user.id)
      formData.append("modelSettings", JSON.stringify(modelSettings))
      
      // Create a timeout promise for the fetch request
      const timeout = 60000 // 60 seconds timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      try {
        console.log("Uploading file to /api/analyze-new")
        setUploadProgress(30)
        setStepsCompleted((prev) => ({ ...prev, upload: true }))
        setCurrentStep("Extracting biomarkers...")
        
        // Make the API request with timeout
        const response = await fetch("/api/analyze-new", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        })
        
        // Clear the timeout
        clearTimeout(timeoutId)
        
        console.log("Upload response status:", response.status)
        
        if (!response.ok) {
          let errorText = "Failed to process the lab report"
          let details = ""
          
          try {
            const errorData = await response.json()
            console.error("Error response:", errorData)
            errorText = errorData.error || errorText
            details = errorData.details || ""
            
            // Handle specific database errors more gracefully
            if (handleDatabaseError(errorText, details)) {
              setIsUploading(false)
              return
            }
            
            // Check for schema-related errors
            if (errorText.includes("schema") || details.includes("column") || 
                errorData.suggestion?.includes("SQL")) {
              console.log("Database schema issue detected:", errorData);
              toast({
                title: "Database Schema Error",
                description: "The database is not set up correctly. This has been logged for troubleshooting. You can try again in a few minutes.",
                variant: "destructive",
              })
              setIsUploading(false)
              return
            }
            
            // Check for other specific error types and provide helpful messages
            if (response.status === 500) {
              console.log("Server error details:", errorData);
              if (details.includes("permission denied") || errorText.includes("access denied")) {
                toast({
                  title: "Permission Error",
                  description: "You don't have permission to perform this action. Please log out and log back in.",
                  variant: "destructive",
                })
              } else {
                toast({
                  title: "Server Error",
                  description: "The server encountered an error processing your file. Our team has been notified.",
                  variant: "destructive",
                })
              }
              setIsUploading(false)
              return
            }
          } catch (e) {
            console.error("Failed to parse error response:", e)
          }
          
          toast({
            title: errorText,
            description: details || "There was an error processing your lab report",
            variant: "destructive",
          })
          setIsUploading(false)
          return
        }
        
        setUploadProgress(70)
        setStepsCompleted((prev) => ({ ...prev, extraction: true }))
        setCurrentStep("Analyzing results...")
        
        // Parse the response
        let responseData
        try {
          responseData = await response.json()
          console.log("Upload response data:", responseData)
        } catch (jsonError) {
          console.error("Error parsing JSON response:", jsonError)
          toast({
            title: "Error processing response",
            description: "The server returned an invalid response",
            variant: "destructive",
          })
          setIsUploading(false)
          return
        }
        
        setUploadProgress(90)
        setStepsCompleted((prev) => ({ ...prev, analysis: true }))
        setCurrentStep("Saving to your health record...")
        
        // Complete the upload
        setUploadProgress(100)
        setStepsCompleted((prev) => ({ ...prev, storage: true }))
        setCurrentStep("Complete!")
        
        toast({
          title: "Upload successful",
          description: "Your lab report has been uploaded and processed",
          variant: "default",
        })
        
        // Redirect to the lab report page
        if (responseData && responseData.reportId) {
          setTimeout(() => {
            router.push(`/dashboard/labs/${responseData.reportId}`)
          }, 1000)
        }
      } catch (fetchError: any) {
        // Clear the timeout if there was an error
        clearTimeout(timeoutId)
        
        console.error("Fetch error:", fetchError)
        
        // Handle different types of fetch errors
        if (fetchError.name === "AbortError") {
          toast({
            title: "Request timeout",
            description: "The server took too long to respond. Please try again later.",
            variant: "destructive",
          })
        } else if (!navigator.onLine) {
          toast({
            title: "Network connection error",
            description: "Please check your internet connection and try again.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Upload failed",
            description: fetchError.message || "Failed to upload the lab report. Please try again.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Upload error:", error)
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }
  
  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }
  
  // Handle specific database errors more gracefully
  const handleDatabaseError = (errorText: string, details: string) => {
    console.error("Database error:", errorText, details);
    
    // Check for NOT NULL constraint violations
    if (details.includes("violates not-null constraint") || errorText.includes("null value in column")) {
      const columnMatch = details.match(/column "([^"]+)"/);
      const columnName = columnMatch ? columnMatch[1] : "unknown";
      
      toast({
        title: "Database Error",
        description: `Missing required data for column '${columnName}'. This is a configuration issue that has been logged.`,
        variant: "destructive",
      });
      return true;
    }
    
    // Check for column doesn't exist errors
    if (details.includes("column") && details.includes("does not exist")) {
      toast({
        title: "Database Schema Error",
        description: "The database schema doesn't match what the application expects. Please run the setup script.",
        variant: "destructive",
      });
      return true;
    }
    
    return false;
  }
  
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Upload Lab Report</CardTitle>
        <CardDescription>
          Upload your PDF lab report to extract and analyze your health data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Lab Report PDF</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="file"
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="application/pdf"
                disabled={isUploading}
              />
              <Button 
                type="button" 
                onClick={handleButtonClick}
                variant="outline"
                className="flex-1"
                disabled={isUploading}
              >
                <FaUpload className="mr-2" />
                {selectedFile ? selectedFile.name : "Select PDF"}
              </Button>
              {selectedFile && (
                <Button
                  type="submit"
                  disabled={isUploading}
                  className="ml-2"
                >
                  {isUploading ? "Processing..." : "Upload"}
                </Button>
              )}
            </div>
            {selectedFile && (
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>
          
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{currentStep}</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className={`flex flex-col items-center p-2 rounded-md ${stepsCompleted.upload ? "bg-green-50" : "bg-gray-50"}`}>
                  {stepsCompleted.upload ? <FaCheck className="text-green-500" /> : <FaSpinner className="animate-spin text-gray-500" />}
                  <span className="text-xs mt-1">Upload</span>
                </div>
                <div className={`flex flex-col items-center p-2 rounded-md ${stepsCompleted.extraction ? "bg-green-50" : "bg-gray-50"}`}>
                  {stepsCompleted.extraction ? <FaCheck className="text-green-500" /> : 
                    stepsCompleted.upload ? <FaSpinner className="animate-spin text-gray-500" /> : 
                    <FaSpinner className="text-gray-300" />}
                  <span className="text-xs mt-1">Extract</span>
                </div>
                <div className={`flex flex-col items-center p-2 rounded-md ${stepsCompleted.analysis ? "bg-green-50" : "bg-gray-50"}`}>
                  {stepsCompleted.analysis ? <FaCheck className="text-green-500" /> : 
                    stepsCompleted.extraction ? <FaSpinner className="animate-spin text-gray-500" /> : 
                    <FaSpinner className="text-gray-300" />}
                  <span className="text-xs mt-1">Analyze</span>
                </div>
                <div className={`flex flex-col items-center p-2 rounded-md ${stepsCompleted.storage ? "bg-green-50" : "bg-gray-50"}`}>
                  {stepsCompleted.storage ? <FaCheck className="text-green-500" /> : 
                    stepsCompleted.analysis ? <FaSpinner className="animate-spin text-gray-500" /> : 
                    <FaSpinner className="text-gray-300" />}
                  <span className="text-xs mt-1">Save</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="text-sm text-gray-500 mt-4">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-amber-500 mr-2" />
              <span>Only PDF files are supported (max 10MB)</span>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

