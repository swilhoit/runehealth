"use client"

import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard, Activity, Heart, Brain, Dna } from "lucide-react"
import { motion } from "framer-motion"

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-thin text-sand-900 mb-2">Health Overview</h1>
        <p className="text-sand-600 font-light">Your health metrics at a glance</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { title: "Heart Health", icon: Heart, score: "Good", color: "text-terra-600" },
            { title: "Brain Health", icon: Brain, score: "Excellent", color: "text-sage-600" },
            { title: "Metabolism", icon: Activity, score: "Fair", color: "text-sand-600" },
            { title: "Genetics", icon: Dna, score: "Unknown", color: "text-sand-400" },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-sand-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-light">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-light text-sand-900">{item.score}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-sand-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-light">
                  <Activity className="h-5 w-5 text-terra-600" />
                  Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-sand-600 font-light">
                  Upload lab results to see your health trends
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-sand-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-light">
                  <LayoutDashboard className="h-5 w-5 text-terra-600" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sand-600 font-light">
                    Complete your health profile to receive personalized recommendations
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Suspense>
    </div>
  )
}

