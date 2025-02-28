import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"
import { DisclaimerBanner } from "@/components/disclaimer-banner"
import { Footer } from "@/components/footer"
import { ErrorBoundary } from "@/lib/error-boundary"

export const metadata: Metadata = {
  title: "Rune - Blood Labs Dashboard",
  description: "Analyze your blood test results with AI",
  icons: {
    icon: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Avatar-fMtSd4VKV0IXp928G8i1bDFN2d1yIF.png",
        type: "image/png",
      },
    ],
    apple: [
      { url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Avatar-fMtSd4VKV0IXp928G8i1bDFN2d1yIF.png" },
    ],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ErrorBoundary>
          <DisclaimerBanner />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  )
}



import './globals.css'