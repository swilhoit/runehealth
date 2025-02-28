import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export default function PlanPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-sand-900">Daily Plan</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-terra-600" />
              Your Health Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sand-600">Your personalized health plan will appear here.</p>
          </CardContent>
        </Card>
      </Suspense>
    </div>
  )
}

