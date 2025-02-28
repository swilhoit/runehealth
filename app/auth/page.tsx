"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AnimatedGradientBackground } from "@/components/animated-gradient-background"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const searchParams = useSearchParams()

  // Store redirectedFrom in localStorage when the component mounts
  useEffect(() => {
    const redirectedFrom = searchParams.get("redirectedFrom")
    if (redirectedFrom) {
      localStorage.setItem("redirectedFrom", redirectedFrom)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedGradientBackground />
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-thin text-sand-900 mb-2">Welcome to Rune</h1>
          <p className="text-sand-700 font-light">Your personal health analytics platform</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-sand-200">
          <div className="p-6">
            <div className="flex gap-2 mb-6">
              <Button variant={isLogin ? "default" : "outline"} className="flex-1" onClick={() => setIsLogin(true)}>
                Login
              </Button>
              <Button variant={!isLogin ? "default" : "outline"} className="flex-1" onClick={() => setIsLogin(false)}>
                Register
              </Button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "register"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {isLogin ? <LoginForm /> : <RegisterForm />}
              </motion.div>
            </AnimatePresence>
          </div>
        </Card>
      </div>
    </div>
  )
}

