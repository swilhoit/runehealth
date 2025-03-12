"use client"

import { useState, useEffect } from "react"
import { DOMAINS } from "@/lib/domain-config"

export default function VerifyDomainConfigPage() {
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchConfig() {
      try {
        // Test API route to verify auth configuration
        const response = await fetch("/api/auth/supabase-site-url")
        const data = await response.json()
        setInfo(data)
      } catch (err) {
        setError("Error fetching configuration: " + (err instanceof Error ? err.message : String(err)))
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Domain Configuration Test</h1>
      
      <div className="grid gap-6">
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Environment Configuration</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60 text-sm">
            {JSON.stringify({
              NODE_ENV: process.env.NODE_ENV,
              domains: DOMAINS,
              base_url: process.env.NEXT_PUBLIC_BASE_URL,
              window_location: typeof window !== 'undefined' ? window.location.href : 'Server Side',
            }, null, 2)}
          </pre>
        </div>

        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Auth Configuration</h2>
          {loading ? (
            <p>Loading auth configuration...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60 text-sm">
              {JSON.stringify(info, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
} 