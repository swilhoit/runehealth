"use client"

import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Apple, Utensils, Coffee, Salad } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function NutritionPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-thin text-sand-900 mb-2">Nutrition</h1>
          <p className="text-sand-600 font-light">Your personalized nutrition insights and recommendations</p>
        </div>
        <Button className="bg-[#725556] hover:bg-[#725556]/90 text-white">
          <Utensils className="w-4 h-4 mr-2" />
          Log Meal
        </Button>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Breakfast",
              icon: Coffee,
              time: "8:00 AM",
              suggestion: "Oatmeal with berries and nuts",
            },
            {
              title: "Lunch",
              icon: Salad,
              time: "12:30 PM",
              suggestion: "Grilled chicken salad with avocado",
            },
            {
              title: "Dinner",
              icon: Utensils,
              time: "7:00 PM",
              suggestion: "Salmon with quinoa and vegetables",
            },
          ].map((meal, index) => (
            <motion.div
              key={meal.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-sand-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-light">
                    <meal.icon className="h-5 w-5 text-[#725556]" />
                    {meal.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-sand-500">{meal.time}</p>
                    <p className="text-sand-900">{meal.suggestion}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-sand-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-light">
                <Apple className="h-5 w-5 text-[#725556]" />
                Nutritional Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-sand-900">Recommendations</h3>
                  <ul className="space-y-2 text-sand-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#725556]" />
                      Increase protein intake
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#725556]" />
                      Add more leafy greens
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#725556]" />
                      Reduce processed sugars
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium text-sand-900">Goals</h3>
                  <div className="space-y-2">
                    <p className="text-sand-600">Complete your nutrition profile to set personalized goals</p>
                    <Button variant="outline" size="sm">
                      Set Goals
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Suspense>
    </div>
  )
}

