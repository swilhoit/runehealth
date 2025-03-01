import type React from "react"
import "./globals.css"
import { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"
import { DisclaimerBanner } from "@/components/disclaimer-banner"
import { Footer } from "@/components/footer"
import { ErrorBoundary } from "@/lib/error-boundary"
import { TooltipProvider } from "@/components/ui/tooltip"

export const metadata: Metadata = {
  title: {
    default: "RuneHealth",
    template: "%s | RuneHealth"
  },
  description: "Your personal health dashboard powered by AI.",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <TooltipProvider>
          <ErrorBoundary>
            <DisclaimerBanner />
            <main className="min-h-screen">{children}</main>
            {/* Remove footer from all pages - dashboard pages have their own layout anyway */}
            <Toaster />
          </ErrorBoundary>
        </TooltipProvider>
      </body>
    </html>
  )
}

import './globals.css'