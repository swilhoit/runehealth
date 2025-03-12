import type React from "react"
import "./globals.css"
import { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"
import { DisclaimerBanner } from "@/components/disclaimer-banner"
import { Footer } from "@/components/footer"
import { ErrorBoundary } from "@/lib/error-boundary"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SupabaseFetchInterceptor } from "./supabase-provider"

// Force import the fetch interceptor to ensure it runs
import "@/lib/supabase/intercept-fetch"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://app.rune.health';

export const metadata: Metadata = {
  title: {
    default: "RuneHealth",
    template: "%s | RuneHealth"
  },
  description: "Your personal health dashboard powered by AI.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: 'website',
    url: BASE_URL,
    title: 'RuneHealth',
    description: 'Your personal health dashboard powered by AI.',
    siteName: 'RuneHealth',
  },
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
            <SupabaseFetchInterceptor />
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