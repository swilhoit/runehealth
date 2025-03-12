"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RedirectToMainSite() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to main Webflow site
    window.location.href = "https://rune.health"
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl text-gray-600">Redirecting to Rune Health...</p>
    </div>
  )
} 