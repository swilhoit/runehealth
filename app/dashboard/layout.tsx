import type React from "react"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { ChatPanel } from "@/components/chat-panel"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  return (
    <div className="min-h-screen bg-[#F4F0EA]">
      <DashboardNav />

      {/* Main Content */}
      <div className="ml-64 mr-96">
        <div className="container mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border border-sand-200/50 p-6">
            {children}
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      <ChatPanel />
    </div>
  )
}

