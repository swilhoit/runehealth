import { NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/lib/supabase/database.types";

// Helper function to add CORS headers
function corsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return corsHeaders(new NextResponse(null, { status: 204 }));
}

// DELETE handler for lab report deletion
export async function DELETE(request: Request) {
  try {
    // Get the report ID from the request URL
    const url = new URL(request.url);
    const reportId = url.searchParams.get("reportId");

    if (!reportId) {
      return corsHeaders(
        NextResponse.json(
          { success: false, message: "Report ID is required" },
          { status: 400 }
        )
      );
    }

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({ 
      cookies: () => cookieStore 
    });

    // Get the current user to validate ownership
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return corsHeaders(
        NextResponse.json(
          { success: false, message: "Authentication required" },
          { status: 401 }
        )
      );
    }

    const userId = session.user.id;

    // Check if the report exists and belongs to the user
    const { data: report, error: fetchError } = await supabase
      .from("lab_reports")
      .select("id, user_id, file_path")
      .eq("id", reportId)
      .single();

    if (fetchError || !report) {
      return corsHeaders(
        NextResponse.json(
          { 
            success: false, 
            message: "Report not found" 
          },
          { status: 404 }
        )
      );
    }

    // Verify ownership
    if (report.user_id !== userId) {
      return corsHeaders(
        NextResponse.json(
          { 
            success: false, 
            message: "You don't have permission to delete this report" 
          },
          { status: 403 }
        )
      );
    }

    // Start transaction to delete biomarkers and report
    // Delete associated biomarkers first
    const { error: biomarkersError } = await supabase
      .from("biomarkers")
      .delete()
      .eq("report_id", reportId);

    if (biomarkersError) {
      console.error("Error deleting biomarkers:", biomarkersError);
      return corsHeaders(
        NextResponse.json(
          { 
            success: false, 
            message: "Failed to delete biomarkers",
            error: biomarkersError.message
          },
          { status: 500 }
        )
      );
    }

    // Delete the report
    const { error: reportError } = await supabase
      .from("lab_reports")
      .delete()
      .eq("id", reportId);

    if (reportError) {
      console.error("Error deleting report:", reportError);
      return corsHeaders(
        NextResponse.json(
          { 
            success: false, 
            message: "Failed to delete report",
            error: reportError.message
          },
          { status: 500 }
        )
      );
    }

    // Delete the PDF file from storage if it exists
    if (report.file_path) {
      const { error: storageError } = await supabase.storage
        .from("labs")
        .remove([report.file_path]);

      if (storageError) {
        console.warn("Error removing file from storage:", storageError);
        // Continue even if file deletion fails
      }
    }

    return corsHeaders(
      NextResponse.json(
        { 
          success: true, 
          message: "Lab report deleted successfully" 
        },
        { status: 200 }
      )
    );
  } catch (error) {
    console.error("Unexpected error during report deletion:", error);
    return corsHeaders(
      NextResponse.json(
        { 
          success: false, 
          message: "An unexpected error occurred",
          error: error instanceof Error ? error.message : "Unknown error"
        },
        { status: 500 }
      )
    );
  }
} 