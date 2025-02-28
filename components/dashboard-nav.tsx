"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  FileText,
  FlaskRoundIcon as Flask,
  Calendar,
  Utensils,
  Settings,
  LogOut,
  Upload,
} from "lucide-react"

interface UserProfile {
  full_name?: string
  email?: string
}

export function DashboardNav() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setUser({
          full_name: profile?.full_name || session.user.email?.split("@")[0] || "User",
          email: session.user.email,
        })
      }
    }

    fetchUser()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/auth"
  }

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/labs", label: "Lab Results", icon: Flask },
    { href: "/dashboard/upload-labs", label: "Upload Labs", icon: Upload },
    { href: "/dashboard/reports", label: "Reports", icon: FileText },
    { href: "/dashboard/plan", label: "Health Plan", icon: Calendar },
    { href: "/dashboard/nutrition", label: "Nutrition", icon: Utensils },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-sand-200">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-sand-200">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rune-logo-gray-IB1gppoL7WX49QpA7DWB7uLpl5eERu.png"
              alt="Rune Logo"
              width={100}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-sm text-sand-700 rounded-md hover:bg-sand-100 hover:text-sand-900 transition-colors"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </ScrollArea>

        {/* User Profile and Sign Out */}
        <div className="border-t border-sand-200">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>{user?.full_name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sand-900 truncate">{user?.full_name}</p>
                <p className="text-xs text-sand-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sand-700 hover:text-sand-900"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

