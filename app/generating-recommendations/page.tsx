import { Suspense } from "react"
import { PageTransition } from "@/components/page-transition"
import { GeneratingRecommendationsContent } from "@/components/generating-recommendations-content"

export default function GeneratingRecommendationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sand-50 to-terra-50">
      <Suspense fallback={<LoadingFallback />}>
        <PageTransition>
          <GeneratingRecommendationsContent />
        </PageTransition>
      </Suspense>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-terra-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sand-600">Loading...</p>
      </div>
    </div>
  )
}

