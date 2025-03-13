"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugSubdomainPage() {
  const [info, setInfo] = useState({
    currentURL: "",
    hostname: "",
    pathname: "",
    env: process.env.NODE_ENV || "unknown",
    baseURL: process.env.NEXT_PUBLIC_BASE_URL || "undefined"
  })

  useEffect(() => {
    // Get information about the current page
    setInfo({
      currentURL: window.location.href,
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      env: process.env.NODE_ENV || "unknown",
      baseURL: process.env.NEXT_PUBLIC_BASE_URL || "undefined"
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Subdomain Debug Page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-lg mb-2">Request Information</h2>
              <div className="bg-gray-100 p-4 rounded-md">
                <p><strong>Current URL:</strong> {info.currentURL}</p>
                <p><strong>Hostname:</strong> {info.hostname}</p>
                <p><strong>Pathname:</strong> {info.pathname}</p>
                <p><strong>Environment:</strong> {info.env}</p>
                <p><strong>Base URL:</strong> {info.baseURL}</p>
              </div>
            </div>
            
            <div>
              <h2 className="font-semibold text-lg mb-2">Next Steps</h2>
              <p>If you can see this page, your subdomain is working correctly!</p>
              <p className="mt-2">This confirms that non-root pages are accessible on app.rune.health.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 