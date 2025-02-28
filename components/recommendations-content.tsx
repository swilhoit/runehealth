"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Apple, Dumbbell, Brain, Sun, Moon, Utensils, Bike, Calendar, Pill } from "lucide-react"
import { motion } from "framer-motion"

interface Recommendations {
  nutritionRecommendations: string[]
  lifestyleRecommendations: string[]
  mealIdeas: string[]
  activityIdeas: string[]
  supplementSuggestions: string[]
  summary: string
  weeklyPlan: string
}

export function RecommendationsContent() {
  const searchParams = useSearchParams()
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      const id = searchParams.get("id")
      if (!id) {
        setError("No recommendation ID provided")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/recommendations/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch recommendations")
        }
        const data = await response.json()
        setRecommendations(data.recommendations)
      } catch (err) {
        console.error("Error fetching recommendations:", err)
        setError("Failed to fetch recommendations")
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [searchParams])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-terra-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!recommendations) {
    return (
      <Alert className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No recommendations found</AlertTitle>
        <AlertDescription>Please try generating recommendations again.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8 text-sand-900 text-center"
      >
        Your Personalized Health Recommendations
      </motion.h1>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-terra-600">
              <Apple className="h-6 w-6 mr-2" />
              Nutrition Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.nutritionRecommendations.map((rec, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="flex items-start"
                >
                  <Sun className="h-5 w-5 text-terra-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-sand-800">{rec}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-terra-600">
              <Dumbbell className="h-6 w-6 mr-2" />
              Lifestyle Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.lifestyleRecommendations.map((rec, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="flex items-start"
                >
                  <Moon className="h-5 w-5 text-terra-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-sand-800">{rec}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2 mt-8">
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-terra-600">
              <Utensils className="h-6 w-6 mr-2" />
              Recommended Meal Ideas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.mealIdeas.map((meal, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="flex items-start"
                >
                  <Apple className="h-5 w-5 text-terra-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-sand-800">{meal}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-terra-600">
              <Bike className="h-6 w-6 mr-2" />
              Lifestyle Activity Ideas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.activityIdeas.map((activity, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="flex items-start"
                >
                  <Dumbbell className="h-5 w-5 text-terra-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-sand-800">{activity}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="mt-8"
      >
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-terra-600">
              <Pill className="h-6 w-6 mr-2" />
              Supplement Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.supplementSuggestions.map((supplement, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="flex items-start"
                >
                  <Pill className="h-5 w-5 text-terra-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-sand-800">{supplement}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="mt-8"
      >
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-terra-600">
              <Brain className="h-6 w-6 mr-2" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sand-800">{recommendations.summary}</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.4 }}
        className="mt-8"
      >
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-terra-600">
              <Calendar className="h-6 w-6 mr-2" />
              Weekly Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.weeklyPlan.split("\n").map((day, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-20 flex-shrink-0 font-semibold text-terra-600">{day.split(":")[0]}:</div>
                  <div className="flex-grow text-sand-800">{day.split(":")[1]}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

