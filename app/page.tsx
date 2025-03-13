"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const router = useRouter()
  const [hostname, setHostname] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get the current hostname
    const currentHostname = window.location.hostname
    setHostname(currentHostname)
    
    // Only redirect to Webflow if on the main domain
    // If we're on app.rune.health, show this page instead
    if (currentHostname === "rune.health" || currentHostname === "www.rune.health") {
      window.location.href = "https://rune.health"
    } else {
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">RuneHealth App Portal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h2 className="font-semibold text-lg mb-2">Welcome to the RuneHealth App</h2>
              <p className="text-gray-600">
                This is the application portal for RuneHealth. You are currently on: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{hostname}</span>
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button size="lg" onClick={() => router.push("/auth")} className="w-full">
                Log In
              </Button>
              <Button size="lg" onClick={() => router.push("/auth?register=true")} className="w-full" variant="outline">
                Sign Up
              </Button>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-medium mb-2">Quick Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button variant="link" onClick={() => router.push("/dashboard")}>
                  Dashboard
                </Button>
                <Button variant="link" onClick={() => window.location.href = "https://rune.health"}>
                  Main Website
                </Button>
                <Button variant="link" onClick={() => router.push("/debug-subdomain")}>
                  Debug Page
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 