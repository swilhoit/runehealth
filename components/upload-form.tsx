"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Upload, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface UploadState {
  step: "idle" | "uploading" | "processing" | "complete" | "error"
  progress: number
  error: string | null
  details?: any
}

function logOperation(operation: string, details?: any) {
  const timestamp = new Date().toISOString()
  console.log(`[Upload Form] [${timestamp}] ${operation}`, details)
}

export function UploadForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>({
    step: "idle",
    progress: 0,
    error: null,
  })

  const updateState = (newState: Partial<UploadState>) => {
    setUploadState((prev) => {
      const updated = { ...prev, ...newState }
      logOperation("State updated", updated)
      return updated
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const selectedFile = files[0]
    logOperation("File selected", {
      name: selectedFile.name,
      type: selectedFile.type,
      size: selectedFile.size,
    })

    if (!selectedFile.type.includes("pdf")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      })
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (selectedFile.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
    updateState({ error: null })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to upload",
        variant: "destructive",
      })
      return
    }

    // Create new AbortController for this upload
    abortControllerRef.current = new AbortController()

    updateState({ step: "uploading", progress: 0, error: null })

    try {
      const formData = new FormData()
      formData.append("file", file)

      logOperation("Starting file upload", { fileName: file.name })

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        // Remove any Content-Type header - let the browser set it for FormData
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || error.details || `Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      logOperation("Upload successful", result)

      if (!result.success || !result.reportId) {
        throw new Error("Invalid response from server")
      }

      updateState({ step: "complete", progress: 100 })

      toast({
        title: "Success",
        description: "File uploaded and analysis started",
      })

      // Redirect to the specific lab report page
      router.push(`/dashboard/labs/${result.reportId}`)
    } catch (err) {
      // Check if this was an abort error
      if (err instanceof Error && err.name === "AbortError") {
        logOperation("Upload cancelled by user")
        updateState({ step: "idle", progress: 0, error: null })
        return
      }

      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      logOperation("Upload failed", {
        error: err,
        message: errorMessage,
      })

      updateState({
        step: "error",
        error: errorMessage,
        details: err,
      })

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      abortControllerRef.current = null
    }
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pdf" className="text-sm font-medium text-sand-700">
          Upload PDF Report
        </Label>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            id="pdf"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
            className="flex-1"
            disabled={uploadState.step === "uploading" || uploadState.step === "processing"}
          />
          <Button
            type="submit"
            disabled={!file || uploadState.step === "uploading" || uploadState.step === "processing"}
            className="min-w-[100px]"
          >
            {uploadState.step === "uploading" || uploadState.step === "processing" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploadState.step === "uploading" ? "Uploading..." : "Processing..."}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Analyze
              </>
            )}
          </Button>
          {(uploadState.step === "uploading" || uploadState.step === "processing") && (
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {uploadState.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {uploadState.error}
            {uploadState.details && (
              <pre className="mt-2 text-xs bg-red-950/10 p-2 rounded overflow-auto">
                {JSON.stringify(uploadState.details, null, 2)}
              </pre>
            )}
          </AlertDescription>
        </Alert>
      )}

      {(uploadState.step === "uploading" || uploadState.step === "processing") && (
        <div className="space-y-2">
          <Progress value={uploadState.progress} className="w-full" />
          <p className="text-sm text-sand-600 text-center">
            {uploadState.progress}% complete - {uploadState.step}
          </p>
        </div>
      )}
    </form>
  )
}

