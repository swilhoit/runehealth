"use client"

import { useChat } from "ai/react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Send, ChevronRight, MessageCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function ChatPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error || !session) {
        router.push("/auth")
        return
      }

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

      setUser({
        name: profile?.full_name || session.user.email?.split("@")[0] || "User",
        email: session.user.email,
      })
    }

    fetchUser()
  }, [supabase, router])

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    onFinish: () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    },
  })

  const toggleCollapse = () => setIsCollapsed(!isCollapsed)

  if (isCollapsed) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={toggleCollapse}
          size="lg"
          className="h-14 w-14 rounded-full bg-terra-600 hover:bg-terra-700 text-white shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {messages.length}
            </span>
          )}
        </Button>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        className="fixed inset-y-0 right-0 w-80 bg-white border-l border-sand-200 shadow-lg flex flex-col z-40"
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sand-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm font-medium">Rune Assistant</span>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleCollapse} className="hover:bg-sand-100">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.role === "assistant" ? "" : "flex-row-reverse"}`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={
                      message.role === "assistant"
                        ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Avatar-7Wuy3DH9iB7mlmqBrV9FA7z6JagBfk.png"
                        : "/placeholder.svg"
                    }
                  />
                  <AvatarFallback>{message.role === "assistant" ? "AI" : "You"}</AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${
                    message.role === "assistant" ? "bg-sand-50 text-sand-900" : "bg-terra-600 text-white ml-auto"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-sand-200 bg-white">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

