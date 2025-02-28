"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface DeleteReportButtonProps {
  reportId: string
  onSuccess?: () => void
  className?: string
}

export function DeleteReportButton({ reportId, onSuccess, className }: DeleteReportButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
        throw new Error(errorData.message || `Failed to delete report: ${response.status} ${response.statusText}`)
      }

      // Show success toast
      toast({
        title: "Report deleted",
        description: "The lab report has been successfully deleted",
      })

      // Refresh the page or redirect
      if (onSuccess) {
        onSuccess()
      } else {
        // Default behavior: redirect to dashboard
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting report:", error)
      
      // Show error toast
      toast({
        title: "Failed to delete report",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm" 
          className={className}
          disabled={isDeleting}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Report
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Lab Report</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this lab report? This action cannot be undone.
            All data associated with this report including biomarkers, insights, and recommendations will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Report"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 