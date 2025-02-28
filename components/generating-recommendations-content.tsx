"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const loadingMessages = [
  "Analyzing your health profile...",
  "Generating personalized recommendations...",
  "Creating your custom wellness plan...",
  "Almost there...",
]

export function GeneratingRecommendationsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const generateRecommendations = async () => {
      const data = searchParams.get("data")
      console.log("Received data:", data)

      if (!data) {
        setError("No survey data found")
        return
      }

      try {
        const surveyData = JSON.parse(decodeURIComponent(data))
        console.log("Parsed survey data:", surveyData)

        const response = await fetch("/api/generate-recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(surveyData),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || result.message || "Failed to generate recommendations")
        }

        console.log("API response:", result)

        if (result.id) {
          router.push(`/recommendations?id=${result.id}`)
        } else {
          throw new Error("No recommendation ID received from the API")
        }
      } catch (err) {
        console.error("Error generating recommendations:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      }
    }

    generateRecommendations()
  }, [router, searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sage-50 via-sand-50 to-terra-50">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 via-sand-50 to-terra-50">
      <div className="text-center max-w-lg mx-auto px-4">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="inline-block mb-8"
        >
          <Sparkles className="w-16 h-16 text-terra-600" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <h2 className="text-3xl font-semibold text-sand-800 mb-4">Generating Your Personalized Recommendations</h2>
          <motion.div
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sand-600 text-lg"
          >
            {loadingMessages[messageIndex]}
          </motion.div>
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full bg-terra-400"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

