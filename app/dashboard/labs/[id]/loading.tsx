import { Card } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-10 w-48 bg-sand-200 animate-pulse rounded" />
        <div className="h-6 w-32 bg-sand-200 animate-pulse rounded" />
      </div>

      <Card className="p-8">
        <div className="space-y-8">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-terra-600 border-t-transparent" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-sand-200 animate-pulse rounded" />
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

