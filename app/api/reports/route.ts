import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { Logger } from "@/lib/logging"

// Use Node.js runtime for database operations
export const runtime = "nodejs"

/**
 * GET /api/reports
 * 
 * Lists lab reports for the authenticated user,
 * with option to filter duplicate dates
 */
export async function GET(request: Request) {
  const logger = new Logger("api/reports");
  const operation = logger.startOperation("list-reports");
  
  try {
    const url = new URL(request.url);
    // Parse query parameters
    const uniqueDatesOnly = url.searchParams.get('unique_dates') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '100');
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    logger.setUserId(user.id);
    
    // Query lab reports
    const query = supabase
      .from("lab_reports")
      .select("id, created_at, report_date, test_date, lab_name, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);
    
    const { data: reports, error: reportsError } = await query;
    
    if (reportsError) {
      operation.fail(reportsError);
      return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }
    
    // Filter reports with duplicate test dates if required
    let filteredReports = reports;
    if (uniqueDatesOnly && reports) {
      const dateMap = new Map();
      
      // Keep only the most recent report for each test date
      filteredReports = reports.filter(report => {
        const testDate = report.test_date || report.report_date || report.created_at;
        const dateStr = new Date(testDate).toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!dateMap.has(dateStr)) {
          dateMap.set(dateStr, true);
          return true;
        }
        return false;
      });
      
      logger.info(`Filtered ${reports.length} reports to ${filteredReports.length} unique test dates`);
    }
    
    operation.end({ status: "success" });
    
    return NextResponse.json({
      reports: filteredReports,
      count: filteredReports.length,
      uniqueDatesOnly
    });
  } catch (error) {
    operation.fail(error);
    
    return NextResponse.json(
      { 
        error: "Failed to process request",
        message: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
} 