"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText, ClipboardList, Activity, AlertCircle, Zap } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export default function ReportsPage() {
  const searchParams = useSearchParams()
  const surveyId = searchParams.get('survey')
  const [surveyData, setSurveyData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (surveyId) {
      fetchSurveyData(surveyId)
    }
  }, [surveyId])

  const fetchSurveyData = async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError("Please log in to view this report.")
        return
      }

      const { data, error } = await supabase
        .from('survey_results')
        .select('*')
        .eq('id', id)
        .eq('user_id', session.user.id)
        .single()

      if (error) {
        console.error("Error fetching survey data:", error)
        setError("Failed to load survey data")
      } else if (data) {
        setSurveyData(data)
      } else {
        setError("Survey not found or you don't have permission to view it")
      }
    } catch (err) {
      console.error("Exception fetching survey data:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getScoreDescription = (score: number) => {
    if (score >= 8) return { text: "Excellent", color: "bg-green-500" }
    if (score >= 6) return { text: "Good", color: "bg-emerald-500" }
    if (score >= 4) return { text: "Average", color: "bg-amber-500" }
    if (score >= 2) return { text: "Fair", color: "bg-orange-500" }
    return { text: "Poor", color: "bg-red-500" }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-sand-900">Reports</h1>
      
      {surveyId ? (
        <Suspense fallback={<div>Loading survey data...</div>}>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terra-600"></div>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : surveyData ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-terra-600" />
                        Health Survey Report
                      </CardTitle>
                      <CardDescription>
                        Completed on {formatDate(surveyData.created_at)}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = "/dashboard/health-survey"}
                    >
                      Back to Surveys
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-10">
                  {/* Personal Information Section */}
                  <div>
                    <h2 className="text-2xl font-light text-sand-900 mb-6 pb-2 border-b border-sand-200 flex items-center gap-2">
                      <FileText className="h-6 w-6 text-terra-600" />
                      Personal Information
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="bg-sand-50 rounded-lg p-5">
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sand-600 font-medium">Name</span>
                              <span className="font-semibold text-sand-900">{surveyData.survey_data.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sand-600 font-medium">Age</span>
                              <span className="font-semibold text-sand-900">{surveyData.survey_data.age}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sand-600 font-medium">Gender</span>
                              <span className="font-semibold text-sand-900">{surveyData.survey_data.gender}</span>
                            </div>
                            {surveyData.survey_data.height && (
                              <div className="flex justify-between">
                                <span className="text-sand-600 font-medium">Height</span>
                                <span className="font-semibold text-sand-900">{surveyData.survey_data.height} cm</span>
                              </div>
                            )}
                            {surveyData.survey_data.weight && (
                              <div className="flex justify-between">
                                <span className="text-sand-600 font-medium">Weight</span>
                                <span className="font-semibold text-sand-900">{surveyData.survey_data.weight} kg</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-sand-900">Health Metrics</h3>
                        <div className="space-y-5">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sand-600">Sleep Quality</span>
                              <span className="font-medium">
                                {getScoreDescription(surveyData.survey_data.sleepQuality).text}
                              </span>
                            </div>
                            <Progress 
                              value={surveyData.survey_data.sleepQuality * 10} 
                              className={`h-2 ${getScoreDescription(surveyData.survey_data.sleepQuality).color}`}
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sand-600">Stress Level</span>
                              <span className="font-medium">
                                {getScoreDescription(10 - surveyData.survey_data.stressLevel).text}
                              </span>
                            </div>
                            <Progress 
                              value={(10 - surveyData.survey_data.stressLevel) * 10} 
                              className={`h-2 ${getScoreDescription(10 - surveyData.survey_data.stressLevel).color}`}
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sand-600">Exercise Frequency</span>
                              <span className="font-medium">
                                {getScoreDescription(surveyData.survey_data.exerciseFrequency).text}
                              </span>
                            </div>
                            <Progress 
                              value={surveyData.survey_data.exerciseFrequency * 10} 
                              className={`h-2 ${getScoreDescription(surveyData.survey_data.exerciseFrequency).color}`}
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sand-600">Hydration</span>
                              <span className="font-medium">
                                {getScoreDescription(surveyData.survey_data.waterIntake).text}
                              </span>
                            </div>
                            <Progress 
                              value={surveyData.survey_data.waterIntake * 10} 
                              className={`h-2 ${getScoreDescription(surveyData.survey_data.waterIntake).color}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Health Information */}
                  <div>
                    <h2 className="text-2xl font-light text-sand-900 mb-6 pb-2 border-b border-sand-200 flex items-center gap-2">
                      <ClipboardList className="h-6 w-6 text-terra-600" />
                      Detailed Health Information
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-sand-50 rounded-lg p-5">
                        <h3 className="text-lg font-medium text-sand-900 mb-4">Reported Symptoms</h3>
                        {surveyData.survey_data.symptoms.length > 0 ? (
                          <ul className="space-y-2">
                            {surveyData.survey_data.symptoms.map((symptom: string) => (
                              <li key={symptom} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-sand-700">{symptom}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sand-500 italic">No symptoms reported</p>
                        )}
                      </div>
                      
                      <div className="bg-sand-50 rounded-lg p-5">
                        <h3 className="text-lg font-medium text-sand-900 mb-4">Health Goals</h3>
                        {surveyData.survey_data.healthGoals.length > 0 ? (
                          <ul className="space-y-2">
                            {surveyData.survey_data.healthGoals.map((goal: string) => (
                              <li key={goal} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-terra-600"></div>
                                <span className="text-sand-700">{goal}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sand-500 italic">No health goals specified</p>
                        )}
                      </div>
                      
                      <div className="bg-sand-50 rounded-lg p-5">
                        <h3 className="text-lg font-medium text-sand-900 mb-4">Dietary Habits</h3>
                        {surveyData.survey_data.dietaryHabits.length > 0 ? (
                          <ul className="space-y-2">
                            {surveyData.survey_data.dietaryHabits.map((habit: string) => (
                              <li key={habit} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sand-700">{habit}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sand-500 italic">No dietary habits specified</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Basic Recommendations */}
                  <div>
                    <h2 className="text-2xl font-light text-sand-900 mb-6 pb-2 border-b border-sand-200 flex items-center gap-2">
                      <Activity className="h-6 w-6 text-terra-600" />
                      Basic Recommendations
                    </h2>
                    <div className="bg-sand-50 rounded-lg p-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-sand-900 mb-2">General</h3>
                          <p className="text-sand-700">{surveyData.recommendations.general}</p>
                        </div>
                        
                        {surveyData.recommendations.lifestyle && surveyData.recommendations.lifestyle.length > 0 && (
                          <div>
                            <h3 className="text-lg font-medium text-sand-900 mb-2">Lifestyle Recommendations</h3>
                            <ul className="space-y-3">
                              {surveyData.recommendations.lifestyle.map((rec: string, index: number) => (
                                <li key={index} className="flex items-start gap-3 bg-white p-3 rounded-md shadow-sm">
                                  <Activity className="h-5 w-5 text-terra-600 shrink-0 mt-0.5" />
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI-Generated Insights */}
                  {surveyData.recommendations.ai && (
                    <div>
                      <h2 className="text-2xl font-light text-sand-900 mb-6 pb-2 border-b border-sand-200 flex items-center gap-2">
                        <Zap className="h-6 w-6 text-terra-600" />
                        AI-Generated Insights
                      </h2>
                      
                      <div className="bg-gradient-to-br from-sage-50/50 via-terra-50/30 to-sand-50/50 rounded-lg p-6 border border-terra-100">
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-medium text-sand-900 mb-2">Summary</h3>
                            <p className="text-sand-700 bg-white bg-opacity-70 p-4 rounded-md shadow-sm">{surveyData.recommendations.ai.summary}</p>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-lg font-medium text-sand-900 mb-3 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                Nutrition Recommendations
                              </h3>
                              {surveyData.recommendations.ai.nutritionRecommendations?.length > 0 ? (
                                <ul className="space-y-2 bg-white bg-opacity-70 p-4 rounded-md shadow-sm">
                                  {surveyData.recommendations.ai.nutritionRecommendations.map((rec: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2 pb-2 border-b border-sand-100 last:border-0 last:pb-0">
                                      <span className="text-sand-700">{index + 1}. {rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sand-500 italic">No nutrition recommendations available</p>
                              )}
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-medium text-sand-900 mb-3 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                Lifestyle Recommendations
                              </h3>
                              {surveyData.recommendations.ai.lifestyleRecommendations?.length > 0 ? (
                                <ul className="space-y-2 bg-white bg-opacity-70 p-4 rounded-md shadow-sm">
                                  {surveyData.recommendations.ai.lifestyleRecommendations.map((rec: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2 pb-2 border-b border-sand-100 last:border-0 last:pb-0">
                                      <span className="text-sand-700">{index + 1}. {rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sand-500 italic">No lifestyle recommendations available</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-lg font-medium text-sand-900 mb-3 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                Meal Ideas
                              </h3>
                              {surveyData.recommendations.ai.mealIdeas?.length > 0 ? (
                                <ul className="space-y-2 bg-white bg-opacity-70 p-4 rounded-md shadow-sm">
                                  {surveyData.recommendations.ai.mealIdeas.map((meal: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2 pb-2 border-b border-sand-100 last:border-0 last:pb-0">
                                      <span className="text-sand-700">{index + 1}. {meal}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sand-500 italic">No meal ideas available</p>
                              )}
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-medium text-sand-900 mb-3 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                Activity Suggestions
                              </h3>
                              {surveyData.recommendations.ai.activityIdeas?.length > 0 ? (
                                <ul className="space-y-2 bg-white bg-opacity-70 p-4 rounded-md shadow-sm">
                                  {surveyData.recommendations.ai.activityIdeas.map((activity: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2 pb-2 border-b border-sand-100 last:border-0 last:pb-0">
                                      <span className="text-sand-700">{index + 1}. {activity}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sand-500 italic">No activity suggestions available</p>
                              )}
                            </div>
                          </div>
                          
                          {surveyData.recommendations.ai.supplementSuggestions?.length > 0 && (
                            <div>
                              <h3 className="text-lg font-medium text-sand-900 mb-3 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                Supplement Suggestions
                              </h3>
                              <div className="bg-white bg-opacity-70 p-4 rounded-md shadow-sm">
                                <p className="text-sand-500 text-sm italic mb-3">
                                  These are general suggestions. Always consult with a healthcare provider before starting any supplements.
                                </p>
                                <ul className="space-y-2">
                                  {surveyData.recommendations.ai.supplementSuggestions.map((supplement: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2 pb-2 border-b border-sand-100 last:border-0 last:pb-0">
                                      <span className="text-sand-700">{index + 1}. {supplement}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                          
                          {surveyData.recommendations.ai.weeklyPlan && (
                            <div>
                              <h3 className="text-lg font-medium text-sand-900 mb-3">Weekly Plan</h3>
                              <div className="bg-white bg-opacity-70 p-4 rounded-md shadow-sm">
                                <p className="text-sand-700 whitespace-pre-line">{surveyData.recommendations.ai.weeklyPlan}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Print and Redo Survey Buttons */}
                  <div className="flex justify-center pt-4 gap-4">
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => window.print()}
                    >
                      <FileText className="h-4 w-4" />
                      Print Report
                    </Button>
                    <Button 
                      className="bg-terra-600 hover:bg-terra-700 text-white gap-2"
                      onClick={() => window.location.href = "/dashboard/health-survey"}
                    >
                      <ClipboardList className="h-4 w-4" />
                      Take New Survey
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-sand-600">No survey data found</p>
            </div>
          )}
        </Suspense>
      ) : (
        <Suspense fallback={<div>Loading...</div>}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-terra-600" />
                Health Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-sand-600">
                  View your health reports and analysis here. Complete a health survey to generate personalized recommendations.
                </p>
                <Button 
                  className="bg-terra-600 hover:bg-terra-700 text-white"
                  onClick={() => window.location.href = "/dashboard/health-survey"}
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Take Health Survey
                </Button>
              </div>
            </CardContent>
          </Card>
        </Suspense>
      )}
    </div>
  )
}

