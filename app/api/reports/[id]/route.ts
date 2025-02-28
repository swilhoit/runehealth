import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { Logger } from "@/lib/logging"

// Use Node.js runtime for database operations
export const runtime = "nodejs"

/**
 * DELETE /api/reports/[id]
 * 
 * Deletes a lab report and all associated data
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const reportId = params.id;
  const logger = new Logger("api/reports/delete");
  const operation = logger.startOperation("delete-report");
  
  try {
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      logger.error("Authentication error", { error: authError });
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    logger.setUserId(user.id);
    logger.info("Processing delete request", { reportId });
    
    // First verify the report belongs to this user
    const { data: report, error: reportError } = await supabase
      .from("lab_reports")
      .select("id, user_id, pdf_url")
      .eq("id", reportId)
      .single();
    
    if (reportError) {
      logger.error("Error fetching report", { error: reportError });
      return NextResponse.json({ 
        error: "Report not found",
        details: reportError.message
      }, { status: 404 });
    }
    
    // Ensure report belongs to authenticated user
    if (report.user_id !== user.id) {
      logger.error("Unauthorized access attempt", { reportId, userId: user.id });
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }
    
    // Start a transaction to delete all related data
    // Delete in reverse order of dependencies
    
    // 1. Delete insights
    const { error: insightsError } = await supabase
      .from("insights")
      .delete()
      .eq("report_id", reportId);
    
    if (insightsError) {
      logger.error("Error deleting insights", { error: insightsError });
      // Continue anyway - we want to try to delete as much as possible
    }
    
    // 2. Delete health scores
    const { error: healthScoreError } = await supabase
      .from("health_scores")
      .delete()
      .eq("report_id", reportId);
    
    if (healthScoreError) {
      logger.error("Error deleting health scores", { error: healthScoreError });
      // Continue anyway
    }
    
    // 3. Delete biomarkers
    const { error: biomarkersError } = await supabase
      .from("biomarkers")
      .delete()
      .eq("report_id", reportId);
    
    if (biomarkersError) {
      logger.error("Error deleting biomarkers", { error: biomarkersError });
      // Continue anyway
    }
    
    // 4. Delete the PDF file from storage if it exists
    if (report.pdf_url) {
      const { error: storageError } = await supabase.storage
        .from("lab-reports")
        .remove([report.pdf_url]);
      
      if (storageError) {
        logger.error("Error deleting PDF file", { error: storageError });
        // Continue anyway
      }
    }
    
    // 5. Finally, delete the lab report record
    const { error: deleteError } = await supabase
      .from("lab_reports")
      .delete()
      .eq("id", reportId);
    
    if (deleteError) {
      logger.error("Error deleting lab report", { error: deleteError });
      return NextResponse.json({ 
        error: "Failed to delete report",
        details: deleteError.message
      }, { status: 500 });
    }
    
    logger.info("Report successfully deleted", { reportId });
    operation.end({ status: "success" });
    
    return NextResponse.json({ 
      success: true,
      message: "Report and associated data deleted successfully"
    });
  } catch (error) {
    logger.error("Unexpected error deleting report", { 
      reportId,
      error: error instanceof Error ? error.message : "Unknown error"
    });
    
    operation.fail(error);
    
    return NextResponse.json(
      { 
        error: "Failed to delete report",
        message: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
} 