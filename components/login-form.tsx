"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

export function LoginForm() {
  const router = useRouter()
  const supabase = createClientComponentClient({
    options: {
      global: {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    },
  })
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
        options: {
          // Set session expiration based on "Remember Me" checkbox
          // 24 hours if not remembered, 30 days if remembered
          persistSession: true, // Always persist the session
          // Choose between short and long session duration
          sessionExpiry: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days : 24 hours
        },
      })

      if (error) {
        throw error
      }

      if (data.user) {
        toast({
          title: "Success",
          description: "You have been logged in successfully.",
        })

        // Force a hard reload to ensure the session is properly updated
        window.location.href = "/dashboard"
      }
    } catch (err) {
      console.error("Login error:", err)
      setError(err instanceof Error ? err.message : "Failed to login")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to login. Please check your credentials.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "demo@example.com",
        password: "demo123456",
        options: {
          persistSession: true,
          sessionExpiry: 24 * 60 * 60, // 24 hours for demo account
        },
      })

      if (error) {
        throw error
      }

      if (data.user) {
        toast({
          title: "Success",
          description: "You have been logged in with the demo account.",
        })

        // Force a hard reload to ensure the session is properly updated
        window.location.href = "/dashboard"
      }
    } catch (err) {
      console.error("Demo login error:", err)
      setError("Failed to login with demo account")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to login with demo account.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div layout className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="bg-white"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className="bg-white"
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked: boolean) => setRememberMe(checked)}
            disabled={isLoading}
            className="border-sand-300 data-[state=checked]:bg-terra-600 data-[state=checked]:border-terra-600"
          />
          <Label htmlFor="rememberMe" className="text-sm text-sand-600 cursor-pointer select-none">
            Remember me for 30 days
          </Label>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-sand-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-sand-600">Or</span>
        </div>
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={handleDemoLogin} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading demo...
          </>
        ) : (
          "Try Demo Account"
        )}
      </Button>
    </motion.div>
  )
}

