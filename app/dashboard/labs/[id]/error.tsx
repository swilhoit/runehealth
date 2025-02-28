"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Lab report error:", error)
  }, [error])

  return (
    <div className="space-y-8">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          <p className="mb-4">An error occurred while loading the lab report.</p>
          <div className="space-x-4">
            <Button onClick={reset} variant="outline">
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/labs">Back to Lab Reports</Link>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}

