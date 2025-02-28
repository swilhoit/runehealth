import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-sand-900">Settings</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-terra-600" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sand-600">Your account settings will appear here.</p>
          </CardContent>
        </Card>
      </Suspense>
    </div>
  )
}

