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
            <div className="mt-8 bg-gradient-to-br from-sand-50 to-sand-100 rounded-lg p-6 shadow-sm border border-sand-200">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-terra-600" />
                <h4 className="text-base font-semibold text-sand-900">AI-Generated Insights</h4>
              </div>
              <ul className="space-y-4">
                {insights.map((insight, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-3 bg-white bg-opacity-70 p-3 rounded-md shadow-sm"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-terra-100 flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-terra-700">{index + 1}</span>
                    </span>
                    <div>
                      <p className="text-sm text-sand-800 leading-relaxed">{insight}</p>
                      <div className="mt-2 text-xs text-sand-600 bg-sand-50 p-2 rounded border-l-2 border-terra-400">
                        <strong>Recommendation:</strong> {generateRecommendation(insight)}
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-4 text-xs text-sand-500 italic text-right">
                Generated using advanced AI analysis of your biomarker patterns
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Generates a more personalized recommendation based on the insight text
 */
function generateRecommendation(insight: string): string {
  // Common recommendations for different insights
  if (insight.toLowerCase().includes("cholesterol") || insight.toLowerCase().includes("lipid")) {
    return "Consider incorporating more omega-3 fatty acids, fiber-rich foods, and regular cardiovascular exercise into your routine.";
  }
  
  if (insight.toLowerCase().includes("glucose") || insight.toLowerCase().includes("insulin")) {
    return "Focus on balancing meals with complex carbohydrates, protein, and healthy fats. Consider limiting refined sugars and monitoring your glycemic response.";
  }
  
  if (insight.toLowerCase().includes("vitamin") || insight.toLowerCase().includes("deficiency")) {
    return "Discuss appropriate supplementation with your healthcare provider and incorporate more nutrient-dense whole foods in your diet.";
  }
  
  if (insight.toLowerCase().includes("liver") || insight.toLowerCase().includes("enzyme")) {
    return "Support liver health with adequate hydration, limiting alcohol consumption, and eating foods rich in antioxidants.";
  }
  
  if (insight.toLowerCase().includes("thyroid")) {
    return "Ensure adequate iodine and selenium in your diet, manage stress levels, and follow up with specialized thyroid testing if recommended.";
  }
  
  if (insight.toLowerCase().includes("inflammation") || insight.toLowerCase().includes("inflammatory")) {
    return "Consider an anti-inflammatory diet rich in colorful fruits and vegetables, omega-3s, and herbs like turmeric and ginger.";
  }
  
  // Default recommendation
  return "Discuss these findings with your healthcare provider for personalized advice and consider lifestyle modifications appropriate for your health goals.";
}

