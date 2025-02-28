"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { PatientSurvey } from "@/components/patient-survey"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

export default function HealthSurveyPage() {
  const [surveys, setSurveys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showSurvey, setShowSurvey] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        console.log("Fetching surveys for user:", session.user.id)
        
        const { data, error } = await supabase
          .from('survey_results')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching surveys:', error.message, error.details, error.hint)
          toast({
            title: "Error",
            description: `Failed to load survey history: ${error.message}`,
            variant: "destructive",
          })
        } else {
          console.log("Surveys fetched successfully:", data?.length || 0, "surveys found")
          setSurveys(data || [])
        }
      } catch (err) {
        console.error('Exception fetching surveys:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSurveys()
  }, [supabase, showSurvey])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleSurveyComplete = async (surveyData: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to save survey results",
          variant: "destructive",
        })
        return
      }

      console.log("Processing survey data for user:", session.user.id)

      // Generate basic recommendations based on survey data
      const recommendations = {
        general: "Based on your responses, we recommend consulting with a healthcare provider for personalized advice.",
        lifestyle: [] as string[]
      }

      // Add some lifestyle recommendations based on survey data
      if (surveyData.sleepQuality < 5) {
        recommendations.lifestyle.push("Consider improving your sleep hygiene for better rest.")
      }
      if (surveyData.stressLevel > 7) {
        recommendations.lifestyle.push("Look into stress management techniques like meditation or deep breathing exercises.")
      }
      if (surveyData.exerciseFrequency < 3) {
        recommendations.lifestyle.push("Try to incorporate more physical activity into your routine.")
      }
      if (surveyData.waterIntake < 5) {
        recommendations.lifestyle.push("Increase your daily water intake for better hydration.")
      }

      console.log("Saving survey data to database...")
      
      // Check if the survey_results table exists
      const { error: tableCheckError } = await supabase
        .from('survey_results')
        .select('count')
        .limit(1)
        .throwOnError()
        .single()

      if (tableCheckError) {
        console.error("Table check error:", tableCheckError.message, tableCheckError.details, tableCheckError.hint)
        
        if (tableCheckError.message.includes("relation") && tableCheckError.message.includes("does not exist")) {
          toast({
            title: "Database Setup Required",
            description: "The survey_results table does not exist. Please run the database migrations first.",
            variant: "destructive",
          })
          return
        }
      }
      
      // Generate AI recommendations using the existing API
      console.log("Requesting AI-generated recommendations...")
      setLoading(true)
      let aiRecommendations = null

      try {
        const response = await fetch('/api/generate-recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(surveyData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('AI recommendations API error:', errorData)
          toast({
            title: "AI Recommendations Warning",
            description: "Could not generate AI insights. Using basic recommendations instead.",
            variant: "destructive",
          })
        } else {
          const data = await response.json()
          console.log("AI recommendations received:", data)
          aiRecommendations = data.recommendations
        }
      } catch (aiError) {
        console.error('Exception in AI recommendations fetch:', aiError)
      }

      // Combine basic and AI recommendations
      const finalRecommendations = {
        ...recommendations,
        ai: aiRecommendations
      }
      
      const { error } = await supabase
        .from('survey_results')
        .insert({
          user_id: session.user.id,
          survey_data: surveyData,
          recommendations: finalRecommendations
        })

      if (error) {
        console.error('Error saving survey:', error.message, error.details, error.hint)
        toast({
          title: "Error",
          description: `Failed to save survey results: ${error.message}`,
          variant: "destructive",
        })
      } else {
        console.log("Survey saved successfully")
        toast({
          title: "Success",
          description: "Your health survey has been saved",
        })
        setShowSurvey(false)
      }
    } catch (err) {
      console.error('Exception saving survey:', err)
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving survey results",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-thin text-sand-900 mb-2">Health Survey</h1>
          <p className="text-sand-600 font-light">Complete health surveys to track your wellness journey</p>
        </div>
        {!showSurvey && (
          <Button 
            className="bg-terra-600 hover:bg-terra-700 text-white"
            onClick={() => setShowSurvey(true)}
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            Take New Survey
          </Button>
        )}
      </div>

      {showSurvey ? (
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-light">Health Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <PatientSurvey onComplete={handleSurveyComplete} />
          </CardContent>
        </Card>
      ) : (
        <>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terra-600"></div>
            </div>
          ) : surveys.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-sand-200">
                <CardContent className="pt-6">
                  <div className="text-center py-10">
                    <ClipboardList className="h-16 w-16 text-sand-400 mx-auto mb-4" />
                    <h3 className="text-xl font-light text-sand-700 mb-2">No surveys completed yet</h3>
                    <p className="text-sand-500 mb-6">Complete a health survey to receive personalized recommendations.</p>
                    <Button 
                      className="bg-terra-600 hover:bg-terra-700 text-white"
                      onClick={() => setShowSurvey(true)}
                    >
                      Take First Survey
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-sand-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-light">
                    <Clock className="h-5 w-5 text-terra-600" />
                    Survey History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {surveys.map((survey) => (
                      <div 
                        key={survey.id} 
                        className="border border-sand-200 rounded-lg p-4 hover:bg-sand-50 transition-colors"
                        onClick={() => window.location.href = `/dashboard/reports?survey=${survey.id}`}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-sand-800">Health Survey</h3>
                            <p className="text-sm text-sand-500">
                              Completed on {formatDate(survey.created_at)}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
} 