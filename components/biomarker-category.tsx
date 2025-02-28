"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Lightbulb } from "lucide-react"
import { motion } from "framer-motion"
import { TestResult } from "@/components/test-result"

interface BiomarkerCategoryProps {
  title: string
  description: string
  biomarkers: Record<
    string,
    {
      value: number
      unit: string
      min: number
      max: number
    }
  >
  insights?: string[]
  missingBiomarkers?: string[]
}

export function BiomarkerCategory({
  title,
  description,
  biomarkers,
  insights = [],
  missingBiomarkers = [],
}: BiomarkerCategoryProps) {
  const hasAbnormalValues = Object.entries(biomarkers).some(([_, data]) => {
    return data.value < data.min || data.value > data.max
  })

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-2">
          {hasAbnormalValues ? (
            <AlertTriangle className="h-5 w-5 text-terra-500" />
          ) : (
            <CheckCircle className="h-5 w-5 text-sage-500" />
          )}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
        {missingBiomarkers.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Missing data for: {missingBiomarkers.join(", ")}</AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(biomarkers).map(([name, data]) => (
            <TestResult
              key={name}
              title={name}
              data={{
                ...data,
                optimal: {
                  min: (data.min + data.max) / 2 - (data.max - data.min) * 0.2,
                  max: (data.min + data.max) / 2 + (data.max - data.min) * 0.2,
                },
              }}
            />
          ))}
          {insights.length > 0 && (
            <div className="mt-8 bg-sand-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-sand-600" />
                <h4 className="text-sm font-semibold text-sand-900">AI Insights</h4>
              </div>
              <ul className="space-y-3">
                {insights.map((insight, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-sand-400 mt-2" />
                    <span className="text-sm text-sand-700">{insight}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

