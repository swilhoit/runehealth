import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { UploadForm } from "@/components/upload-form"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-sand-900">Welcome, {profile?.full_name || "User"}</h1>
        <p className="text-sand-600 mt-2">Upload your lab results to get started with AI-powered insights</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <UploadForm />
      </div>
    </div>
  )
}

