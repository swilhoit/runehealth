import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { Logger } from "@/lib/logging" // Import logger

// Use Node.js runtime for Supabase operations
export const runtime = "nodejs"

export async function GET(request: Request) {
  console.log("\n=== CHAT CONTEXT REQUEST ===");
  console.log(`Request URL: ${request.url}`);
  
  const logger = new Logger("chat-context");
  const requestId = Math.random().toString(36).substring(2, 10);
  
  // Extract report_id from query params if specified
  const url = new URL(request.url);
  const reportId = url.searchParams.get('report_id');
  console.log(`Requested report ID: ${reportId || 'not specified (will use latest)'}`);
  
  // Log headers to check authentication
  try {
    const headerEntries = [...request.headers.entries()];
    console.log("Request headers:", JSON.stringify(
      headerEntries.filter(([key]) => !key.includes('cookie')),
      null, 2
    ));
  } catch (headerError) {
    console.error("Could not log headers:", headerError);
  }
  
  try {
    console.log("Creating Supabase client...");
    const supabase = createRouteHandlerClient({ cookies })
    console.log("Supabase client created");

    // Verify session
    console.log("Verifying session...");
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError);
      logger.error("Failed to get session", { error: sessionError });
      return NextResponse.json({ error: "Authentication error", details: sessionError.message }, { status: 401 })
    }
    
    if (!session) {
      console.log("No active session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    console.log(`Session verified for user: ${session.user.id}`);
    logger.setUserId(session.user.id);

    // Get the requested lab report or the latest one
    console.log(reportId ? "Fetching specified lab report..." : "Fetching latest lab report...");
    let reportQuery = supabase
      .from("lab_reports")
      .select("id, created_at, report_date, test_date, lab_name, status")
      .eq("user_id", session.user.id);
      
    // If a specific report ID was provided, use that instead of the latest
    if (reportId) {
      reportQuery = reportQuery.eq("id", reportId);
    } else {
      reportQuery = reportQuery.order("created_at", { ascending: false });
    }
    
    const { data: latestReport, error: reportError } = await reportQuery.limit(1).single();
    
    if (reportError && reportError.code !== 'PGRST116') {
      console.error("Error fetching lab report:", reportError);
      logger.error("Failed to fetch lab report", { error: reportError });
      throw reportError
    }
    
    if (!latestReport) {
      console.log("No lab reports found for user");
      return NextResponse.json({
        context: {
          hasResults: false,
        },
      })
    }
    
    console.log(`Found lab report: ${latestReport.id} from ${latestReport.lab_name}`);
    
    // Get biomarkers for the latest report
    console.log("Fetching biomarkers...");
    const { data: biomarkers, error: biomarkersError } = await supabase
      .from("biomarkers")
      .select("*")
      .eq("report_id", latestReport.id)
      .order("category", { ascending: true })
    
    if (biomarkersError) {
      console.error("Error fetching biomarkers:", biomarkersError);
      logger.error("Failed to fetch biomarkers", { error: biomarkersError });
      throw biomarkersError
    }
    
    console.log(`Found ${biomarkers?.length || 0} biomarkers`);
    
    // Get insights for the latest report
    console.log("Fetching insights...");
    const { data: insights, error: insightsError } = await supabase
      .from("insights")
      .select("*")
      .eq("report_id", latestReport.id)
      .order("created_at", { ascending: false })
    
    if (insightsError) {
      console.error("Error fetching insights:", insightsError);
      logger.error("Failed to fetch insights", { error: insightsError });
      throw insightsError
    }
    
    console.log(`Found ${insights?.length || 0} insights`);
    
    // Get health score
    console.log("Fetching health score...");
    const { data: healthScore, error: healthScoreError } = await supabase
      .from("health_scores")
      .select("score")
      .eq("report_id", latestReport.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
    
    if (healthScoreError && healthScoreError.code !== 'PGRST116') {
      console.error("Error fetching health score:", healthScoreError);
      logger.error("Failed to fetch health score", { error: healthScoreError });
    }
    
    const score = healthScore?.score || null
    console.log(`Health score: ${score !== null ? score : 'not available'}`);
    
    // Format test date
    const testDate = latestReport.test_date 
      ? new Date(latestReport.test_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'unknown date'

    // Group biomarkers by category
    const biomarkersByCategory = biomarkers?.reduce((acc: Record<string, any[]>, biomarker) => {
      const category = biomarker.category || 'Other'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(biomarker)
      return acc
    }, {}) || {}
    
    // Group insights by type
    const insightsByType = insights?.reduce((acc: Record<string, any[]>, insight) => {
      const type = insight.insight_type || 'observation'
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(insight)
      return acc
    }, {}) || {}

    // Return comprehensive lab data context
    const contextResponse: { context: Record<string, any> } = {
      context: {
        hasResults: true,
        report: {
          id: latestReport.id,
          labName: latestReport.lab_name,
          testDate,
          status: latestReport.status,
        },
        biomarkers: {
          total: biomarkers.length,
          abnormal: biomarkers.filter(b => !b.in_range).length,
          byCategory: biomarkersByCategory,
        },
        insights: insightsByType,
        healthScore: score,
        requestId
      }
    };

    // Fetch the latest health survey for this user
    console.log("Fetching latest health survey data...");
    try {
      const { data: latestSurvey, error: surveyError } = await supabase
        .from("survey_results")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (surveyError && surveyError.code !== 'PGRST116') {
        console.error("Error fetching health survey:", surveyError);
        logger.warn("Failed to fetch health survey", { error: surveyError });
        // Continue without survey data
      } else if (latestSurvey) {
        console.log("Found health survey data from:", new Date(latestSurvey.created_at).toLocaleDateString());
        
        // Format the survey completion date
        const surveyDate = new Date(latestSurvey.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        // Add survey data to context
        contextResponse.context.survey = {
          id: latestSurvey.id,
          completedDate: surveyDate,
          data: latestSurvey.survey_data,
          recommendations: latestSurvey.recommendations
        };
        
        logger.info("Added survey data to chat context", {
          surveyId: latestSurvey.id,
          surveyDate: surveyDate
        });
      } else {
        console.log("No health survey data found");
      }
    } catch (surveyFetchError) {
      console.error("Exception fetching health survey:", surveyFetchError);
      logger.warn("Exception in health survey fetch", { 
        error: surveyFetchError instanceof Error ? surveyFetchError.message : String(surveyFetchError)
      });
      // Continue without survey data
    }
    
    // Fetch previous reports for historical context (limit to 5 most recent, excluding current)
    console.log("Fetching previous reports for historical context...");
    const { data: previousReports, error: previousReportsError } = await supabase
      .from("lab_reports")
      .select("id, created_at, test_date, lab_name")
      .eq("user_id", session.user.id)
      .neq("id", latestReport.id)
      .order("test_date", { ascending: false })
      .limit(5);
      
    if (previousReportsError) {
      console.error("Error fetching previous reports:", previousReportsError);
      logger.warn("Failed to fetch previous reports", { error: previousReportsError });
      // Continue without previous reports
    } else if (previousReports && previousReports.length > 0) {
      console.log(`Found ${previousReports.length} previous reports`);
      
      // Add previous reports to context
      contextResponse.context.previousReports = previousReports.map(report => ({
        id: report.id,
        labName: report.lab_name,
        testDate: report.test_date 
          ? new Date(report.test_date).toLocaleDateString('en-US', { 
              year: 'numeric', month: 'long', day: 'numeric' 
            })
          : 'unknown date',
      }));
    } else {
      console.log("No previous reports found");
    }
    
    // Fetch previous reports for historical context (limit to 3 most recent, excluding current)
    console.log("Fetching previous reports for historical context...");
    const { data: previousReportsHistorical, error: previousReportsErrorHistorical } = await supabase
      .from("lab_reports")
      .select("id, created_at, test_date, lab_name")
      .eq("user_id", session.user.id)
      .neq("id", latestReport.id)
      .order("test_date", { ascending: false })
      .limit(3);
      
    if (previousReportsErrorHistorical) {
      console.error("Error fetching previous reports:", previousReportsErrorHistorical);
      logger.warn("Failed to fetch previous reports", { error: previousReportsErrorHistorical });
      // Continue without previous reports
    } else if (previousReportsHistorical && previousReportsHistorical.length > 0) {
      console.log(`Found ${previousReportsHistorical.length} previous reports`);
      
      // Add previous reports to context
      contextResponse.context.previousReports = previousReportsHistorical.map(report => ({
        id: report.id,
        labName: report.lab_name,
        testDate: report.test_date 
          ? new Date(report.test_date).toLocaleDateString('en-US', { 
              year: 'numeric', month: 'long', day: 'numeric' 
            })
          : 'unknown date',
      }));
    } else {
      console.log("No previous reports found");
    }
    
    console.log(`Returning context with ${biomarkers.length} biomarkers, ${biomarkers.filter(b => !b.in_range).length} abnormal`);
    logger.info("Successfully generated chat context", {
      biomarkerCount: biomarkers.length,
      abnormalCount: biomarkers.filter(b => !b.in_range).length,
      hasHealthScore: score !== null,
      reportId: latestReport.id,
      hasPreviousReports: !!contextResponse.context.previousReports
    });
    
    return NextResponse.json(contextResponse)
  } catch (error) {
    console.error("Error generating chat context:", error);
    logger.error("Failed to generate chat context", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      requestId
    });
    
    return NextResponse.json(
      {
        error: "Failed to generate chat context",
        message: error instanceof Error ? error.message : "Unknown error",
        requestId,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

