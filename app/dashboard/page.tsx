"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, ClipboardList, TrendingUp, Clock, Zap, BarChart } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [activityData, setActivityData] = useState({
    labsCount: 0,
    surveysCount: 0,
    latestLabDate: null as string | null,
    latestSurveyDate: null as string | null,
    loading: true
  })
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        // Using supabase client directly, all headers are configured in lib/supabase/client.ts
        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
        
        setUserProfile(profile)
        
        // Get lab reports count
        const { count: labsCount, error: labsError } = await supabase
          .from("lab_reports")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", session.user.id)
        
        if (labsError) {
          console.error("Error fetching lab count:", labsError)
        }
        
        // Get latest lab date
        const { data: latestLab } = await supabase
          .from("lab_reports")
          .select("created_at")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()
        
        // Get survey count
        let surveysCount = 0
        let latestSurvey = null
        
        try {
          const { count, error } = await supabase
            .from("survey_results")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", session.user.id)
          
          if (!error) {
            surveysCount = count || 0
            
            // Get latest survey date
            const { data: latestSurveyData } = await supabase
              .from("survey_results")
              .select("created_at")
              .eq("user_id", session.user.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .single()
            
            latestSurvey = latestSurveyData
          }
        } catch (err) {
          console.error("Survey table may not exist:", err)
        }
        
        setActivityData({
          labsCount: labsCount || 0,
          surveysCount,
          latestLabDate: latestLab?.created_at || null,
          latestSurveyDate: latestSurvey?.created_at || null,
          loading: false
        })
      } catch (error) {
        console.error("Error fetching user data:", error)
        setActivityData(prev => ({ ...prev, loading: false }))
      }
    }
    
    fetchUserData()
  }, [supabase])
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="space-y-8">
      <div className="p-4 rounded-lg bg-[#EDE7DF]">
        <h1 className="text-4xl font-heading font-normal text-sand-900 mb-2">
          {activityData.loading 
            ? "Loading..." 
            : `Welcome, ${userProfile?.full_name || "User"}`
          }
        </h1>
        <p className="text-sand-600 font-light">
          Your personal health dashboard and activity summary
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-[#EDE7DF] h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-heading font-normal flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#725556]" />
                Lab Results
              </CardTitle>
              <CardDescription>
                Track and analyze your lab results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sand-600">Total Labs Uploaded</span>
                  <span className="text-2xl font-semibold text-sand-900">{activityData.labsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sand-600">Latest Upload</span>
                  <span className="text-sand-900">{formatDate(activityData.latestLabDate)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                className="w-full bg-[#725556] hover:bg-[#725556]/90 text-white"
                asChild
              >
                <Link href="/dashboard/upload-labs">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Lab Results
                </Link>
              </Button>
              {activityData.labsCount > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full border-[#725556] text-[#725556] hover:bg-[#725556]/10" 
                  asChild
                >
                  <Link href="/dashboard/labs">
                    <BarChart className="mr-2 h-4 w-4" />
                    View Lab History
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-[#EDE7DF] h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-heading font-normal flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-[#725556]" />
                Health Surveys
              </CardTitle>
              <CardDescription>
                Track your health journey with regular surveys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sand-600">Surveys Completed</span>
                  <span className="text-2xl font-semibold text-sand-900">{activityData.surveysCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sand-600">Latest Survey</span>
                  <span className="text-sand-900">{formatDate(activityData.latestSurveyDate)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                className="w-full bg-[#725556] hover:bg-[#725556]/90 text-white"
                asChild
              >
                <Link href="/dashboard/health-survey">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Take Health Survey
                </Link>
              </Button>
              {activityData.surveysCount > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full border-[#725556] text-[#725556] hover:bg-[#725556]/10" 
                  asChild
                >
                  <Link href="/dashboard/reports">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Survey Reports
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="border-[#EDE7DF]">
          <CardHeader>
            <CardTitle className="text-xl font-heading font-normal flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#725556]" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Link href="/dashboard/upload-labs">
                <Card className="border border-[#EDE7DF] hover:border-[#725556]/30 hover:shadow-md transition-all cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <Upload className="h-8 w-8 text-[#725556] mb-2" />
                      <h3 className="font-medium text-sand-900">Upload Labs</h3>
                      <p className="text-xs text-sand-500 mt-1">Upload and analyze new lab results</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/dashboard/health-survey">
                <Card className="border border-[#EDE7DF] hover:border-[#725556]/30 hover:shadow-md transition-all cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <ClipboardList className="h-8 w-8 text-[#725556] mb-2" />
                      <h3 className="font-medium text-sand-900">Take Survey</h3>
                      <p className="text-xs text-sand-500 mt-1">Complete your health assessment</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/dashboard/reports">
                <Card className="border border-[#EDE7DF] hover:border-[#725556]/30 hover:shadow-md transition-all cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <TrendingUp className="h-8 w-8 text-[#725556] mb-2" />
                      <h3 className="font-medium text-sand-900">View Reports</h3>
                      <p className="text-xs text-sand-500 mt-1">See your health insights and trends</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

