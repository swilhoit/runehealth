import Link from "next/link"
import { FileX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <FileX className="h-16 w-16 text-terra-500 mb-6" />
      <h1 className="text-2xl font-medium text-sand-900 mb-2">Lab Report Not Found</h1>
      <p className="text-sand-600 mb-8">
        The lab report you're looking for doesn't exist or you don't have access to it.
      </p>
      <Button asChild variant="default" className="bg-terra-600 hover:bg-terra-700">
        <Link href="/dashboard/labs">Back to Lab Reports</Link>
      </Button>
    </div>
  )
}

