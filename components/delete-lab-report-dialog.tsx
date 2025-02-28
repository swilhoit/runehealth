import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/supabase/database.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface DeleteLabReportDialogProps {
  reportId: string;
  reportName?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export default function DeleteLabReportDialog({
  reportId,
  reportName = "Lab Report",
  isOpen,
  onOpenChange,
  onDeleted
}: DeleteLabReportDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClientComponentClient<Database>();

  const handleDelete = async () => {
    if (!reportId) return;

    setIsDeleting(true);
    try {
      // Call our API endpoint to handle the deletion
      const response = await fetch(`/api/lab-reports/delete?reportId=${reportId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete lab report");
      }

      toast({
        title: "Lab report deleted",
        description: "The lab report has been successfully deleted.",
        variant: "default"
      });

      // Close the dialog and notify parent
      onOpenChange(false);
      onDeleted();
    } catch (error) {
      console.error("Error deleting lab report:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete lab report",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Lab Report</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this lab report? This action cannot be undone.
            All biomarker data associated with this report will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 