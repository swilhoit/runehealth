"use client"

import { useChat } from "ai/react"
import { useState, useEffect, useRef, Fragment } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Send, ChevronRight, MessageSquare, Beaker, Activity, BadgeInfo, ClipboardList, Copy, Check, Settings, RefreshCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import ReactMarkdown from 'react-markdown'
import { Gelasio, Albert_Sans, Gilda_Display, Inter } from 'next/font/google'
import { getModelSettings } from "@/lib/ai-utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { nanoid } from "nanoid"
import { cn } from "@/lib/utils"

// Font definitions
const albertSans = Albert_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-albert-sans',
})

const gelasio = Gelasio({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-gelasio',
})

// Google font for Gilda Display
const gildaDisplay = Gilda_Display({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-gilda-display',
})

// Using Inter as a replacement for Geist-Thin (which is no longer needed)
const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400'],
  display: 'swap',
  variable: '--font-inter',
})

// Combine font classes for global use
const fontClasses = `${albertSans.variable} ${gelasio.variable} ${gildaDisplay.variable} ${inter.variable}`;

// Define button styles based on the provided design
const buttonStyles = {
  primary: "bg-[#725556] hover:bg-[#725556]/90 text-white",
  primaryAlt1: "bg-[#865C69] hover:bg-[#865C69]/90 text-white",
  primaryAlt2: "bg-[#725556] hover:bg-[#725556]/90 text-white",
  secondary: "bg-[#865C69] hover:bg-[#865C69]/90 text-white",
  secondaryOutline: "border border-white hover:bg-white/10 text-white bg-transparent",
};

interface LabContext {
  hasResults: boolean;
  report?: {
    id: string;
    testDate: string;
    labName: string;
    status: string;
  };
  biomarkers?: {
    total: number;
    abnormal: number;
    byCategory: Record<string, any[]>;
  };
  insights?: Record<string, any[]>;
  healthScore?: number | null;
  survey?: {
    completedDate: string;
    data: {
      symptoms: string[];
      sleepQuality: number;
      stressLevel: number;
      exerciseFrequency: number;
    };
    recommendations: {
      ai: {
        summary: string;
      };
    };
  };
}

// Add typing animation component
const TypingAnimation = () => (
  <div className="flex space-x-1 items-center p-2">
    <div className="w-2 h-2 rounded-full bg-[#725556] animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 rounded-full bg-[#725556] animate-bounce" style={{ animationDelay: '100ms' }}></div>
    <div className="w-2 h-2 rounded-full bg-[#725556] animate-bounce" style={{ animationDelay: '200ms' }}></div>
  </div>
);

export function ChatPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [labContext, setLabContext] = useState<LabContext | null>(null)
  const [currentReportId, setCurrentReportId] = useState<string | null>(null)
  const [showLabPanel, setShowLabPanel] = useState(false)
  const [hasSurveyData, setHasSurveyData] = useState(false)
  const [showSurveyPanel, setShowSurveyPanel] = useState(false)
  const [currentModel, setCurrentModel] = useState<{provider: string, model: string} | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient({
    options: {
      global: {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
          'X-Client-Info': 'supabase-js/2.36.0',
        },
      },
    },
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Add or update the apiUrl state
  const [apiUrl, setApiUrl] = useState<string>('/api/chat');
  
  useEffect(() => {
    // Update the API URL with the current origin when the component mounts
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      // Include report ID as context parameter if available
      const contextParam = currentReportId ? `?context=${currentReportId}` : '';
      setApiUrl(`${origin}/api/chat${contextParam}`);
      console.log("Setting chat API URL to:", `${origin}/api/chat${contextParam}`);
    }
  }, [currentReportId]);

  // Get report ID from URL if available
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const reportId = urlParams.get('report');
      if (reportId) {
        console.log(`Report ID from URL: ${reportId}`);
        setCurrentReportId(reportId);
      }
    }
  }, []);

  // Fetch user data and lab context on mount
  useEffect(() => {
    const fetchUserAndLabData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        router.push("/auth")
        return
      }

      // Get user profile
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

      setUser({
        name: profile?.full_name || session.user.email?.split("@")[0] || "User",
        email: session.user.email,
      })

      // Fetch lab context
      try {
        // Create the URL dynamically based on the window location
        const contextEndpoint = `/api/chat-context${currentReportId ? `?report_id=${currentReportId}` : ''}`;
        const contextUrl = typeof window !== 'undefined' 
          ? `${window.location.origin}${contextEndpoint}`
          : contextEndpoint;
        
        console.log(`Fetching lab context from: ${contextUrl}`);
        const response = await fetch(contextUrl);
        
        if (response.ok) {
          const data = await response.json();
          setLabContext(data.context);
          
          // Check if we have survey data
          setHasSurveyData(!!data.context?.survey);
          
          // If we don't have a reportId from the URL but got one from the context, save it
          if (!currentReportId && data.context?.report?.id) {
            setCurrentReportId(data.context.report.id);
          }
        } else {
          console.error("Failed to fetch lab context:", response.status);
          toast({
            title: "Warning",
            description: "Could not load your health data context.",
            variant: "destructive",
          })
        }
      } catch (err) {
        console.error("Error fetching context:", err);
        toast({
          title: "Error",
          description: "Failed to load health context",
          variant: "destructive",
        })
      }
    }

    fetchUserAndLabData()
  }, [supabase, router, toast, currentReportId])

  // Use state to manage messages manually for maximum compatibility
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Custom submit handler to replace useChat
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      createdAt: new Date().toISOString()
    };
    
    // Update messages with user input
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Clear input field
    setInput('');
    
    // Start loading state
    setIsLoading(true);
    
    try {
      // Make sure we're using the URL with latest context
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const contextParam = currentReportId ? `?context=${currentReportId}` : '';
      const chatEndpoint = `${origin}/api/chat${contextParam}`;
      
      console.log("Submitting chat form to:", chatEndpoint);
      
      // Send request to the chat API
      const response = await fetch(chatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          modelSettings: currentModel ? {
            provider: currentModel.provider,
            model: currentModel.model
          } : undefined
        }),
      });
      
      console.log("Chat response received:", response.status);
      
      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status} ${response.statusText}`);
      }
      
      // Parse JSON response
      const assistantMessage = await response.json();
      
      // Add assistant message to the conversation
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
    } catch (err) {
      console.error("Chat error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast({
        title: "Chat Error",
        description: err instanceof Error ? err.message : "Failed to process chat message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Add debug logging for message visibility
  useEffect(() => {
    if (messages.length > 0) {
      console.log("Current messages:", messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content.substring(0, 20) + "...",
      })));
      // Force message visibility
      const newVisibleMessages: Record<string, boolean> = {};
      messages.forEach(m => { newVisibleMessages[m.id] = true; });
      setVisibleMessages(newVisibleMessages);
    }
  }, [messages]);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed)
  const toggleLabPanel = () => setShowLabPanel(!showLabPanel)
  const toggleSurveyPanel = () => setShowSurveyPanel(!showSurveyPanel)

  // Load model settings on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const modelSettings = getModelSettings();
      setCurrentModel({
        provider: modelSettings.provider,
        model: modelSettings.model
      });
    }
  }, []);

  // Handle special command inputs (like /model)
  const handleSpecialCommands = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Handle /model command to show which model is being used
    if (input.trim().toLowerCase() === "/model") {
      const modelInfo = getModelSettings();
      const provider = modelInfo.provider as keyof typeof modelInfo.apiKeys;
      
      // Add "system" message showing model info
      const modelMessage = {
        id: nanoid(),
        role: "assistant" as const,
        content: `📢 **Current AI Configuration**\n\n- **Provider**: ${modelInfo.provider.charAt(0).toUpperCase() + modelInfo.provider.slice(1)}\n- **Model**: ${modelInfo.model}\n- **API Key**: ${modelInfo.apiKeys[provider] ? "✅ Set" : "❌ Not set"}`,
      };
      
      setMessages([...messages, modelMessage]);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      
      // Clear input
      handleInputChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
      return true;
    }
    
    // If no special command was handled, return false to allow normal form submission
    return false;
  };

  // Format message content with markdown
  const formatMessage = (content: string) => {
    // Replace biomarker mentions with highlighted text
    let formattedContent = content
    if (labContext?.biomarkers?.byCategory) {
      Object.entries(labContext.biomarkers.byCategory).forEach(([category, biomarkers]) => {
        biomarkers.forEach(biomarker => {
          const pattern = new RegExp(`\\b${biomarker.name}\\b`, 'gi')
          formattedContent = formattedContent.replace(pattern, `**${biomarker.name}**`)
        })
      })
    }
    return formattedContent
  }

  // Split long messages into multiple chunks for better readability
  const splitMessage = (content: string): string[] => {
    if (content.length < 300) return [content]; // Increased threshold for short messages
    
    // Split by double newlines (paragraphs)
    const paragraphs = content.split(/\n\n+/);
    
    // If we have multiple paragraphs, group them logically
    if (paragraphs.length > 1) {
      const chunks: string[] = [];
      let currentChunk = "";
      
      for (const paragraph of paragraphs) {
        // Start a new chunk if this would make the current one too long
        // Increased threshold for better performance
        if (currentChunk.length + paragraph.length > 600) {
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = paragraph;
        } else {
          currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
        }
      }
      
      if (currentChunk) chunks.push(currentChunk.trim());
      return chunks;
    }
    
    // If just one long paragraph, split at sentence boundaries
    // Only split extremely long content
    if (content.length > 1000) {
      return content
        .replace(/([.!?])\s+/g, "$1\n\n")
        .split(/\n\n/)
        .reduce((chunks: string[], sentence) => {
          const lastChunk = chunks[chunks.length - 1];
          // Increased threshold for sentence chunks
          if (!lastChunk || lastChunk.length + sentence.length > 500) {
            chunks.push(sentence);
          } else {
            chunks[chunks.length - 1] += ". " + sentence;
          }
          return chunks;
        }, []);
    }
    
    // Return as a single chunk if not extremely long
    return [content];
  }

  // Detect message content type for styling
  const getMessageStyle = (content: string) => {
    if (content.includes("**Warning**") || content.includes("⚠️")) {
      return "warning";
    }
    if (content.startsWith("- ") || content.match(/^\d+\./)) {
      return "list";
    }
    if (content.includes("**Recommendation**") || 
        content.includes("I recommend") || 
        content.includes("you should")) {
      return "recommendation";
    }
    if (content.includes("**Summary**") || content.includes("In summary")) {
      return "summary";
    }
    if (content.includes("```")) {
      return "code";
    }
    return "normal";
  }

  // Update or add the message visibility handling
  const [visibleMessages, setVisibleMessages] = useState<Record<string, boolean>>({});

  // Ensure all messages are visible immediately without delay
  useEffect(() => {
    if (messages.length > 0) {
      console.log("Updating message visibility");
      
      // Create an object with all messages set to visible
      const newVisibleMessages = messages.reduce((acc, message) => {
        acc[message.id] = true;
        return acc;
      }, {} as Record<string, boolean>);
      
      // Update the visible messages state
      setVisibleMessages(newVisibleMessages);
      
      console.log("All messages set to visible:", Object.keys(newVisibleMessages).length);
      
      // Scroll to the bottom
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Add copy to clipboard functionality
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };
  
  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update form submission to check for special commands first
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Handle /model command
    if (input.trim().toLowerCase() === "/model") {
      const modelInfo = getModelSettings();
      const provider = modelInfo.provider as keyof typeof modelInfo.apiKeys;
      
      // Add "system" message showing model info
      const modelMessage = {
        id: nanoid(),
        role: "assistant" as const,
        content: `📢 **Current AI Configuration**\n\n- **Provider**: ${modelInfo.provider.charAt(0).toUpperCase() + modelInfo.provider.slice(1)}\n- **Model**: ${modelInfo.model}\n- **API Key**: ${modelInfo.apiKeys[provider] ? "✅ Set" : "❌ Not set"}`,
        createdAt: new Date().toISOString()
      };
      
      setMessages([...messages, modelMessage]);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      
      // Clear input
      setInput("");
      return;
    }
    
    // Otherwise, handle normally
    if (input.trim()) {
      await handleSubmit(e);
    }
  };

  // Let's add a helper function to get the style classes based on the message type
  const getMessageStyleClasses = (contentType: string) => {
    switch (contentType) {
      case 'code':
        return "bg-[#1E293B] text-[#E2E8F0] font-mono";
      case 'warning':
        return "bg-[#FEF9C3] border border-[#FACC15]";
      case 'recommendation':
        return "bg-[#DCFCE7] border border-[#86EFAC]";
      case 'summary':
        return "bg-[#F3E8FF] border border-[#D8B4FE]";
      case 'list':
        return "bg-white border border-[#ECE8E6]";
      default:
        return "bg-white border border-[#ECE8E6]";
    }
  };

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`${fontClasses} fixed bottom-4 right-4 z-50`}
        >
          <Button
            onClick={toggleCollapse}
            size="lg"
            className={`h-14 w-14 rounded-full ${buttonStyles.primary} shadow-lg`}
          >
            <MessageSquare className="h-6 w-6" />
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#7923C] text-white text-xs flex items-center justify-center font-[var(--font-albert-sans)] font-light">
                {messages.length}
              </span>
            )}
          </Button>
        </motion.div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <AnimatePresence>
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: isCollapsed ? "calc(100% - 48px)" : 0 }}
          transition={{ duration: 0.3 }}
          className={`${fontClasses} fixed inset-y-0 right-0 w-96 bg-[#F4F0EA] border-l border-[#ECE8E6] shadow-lg flex flex-col z-40`}
        >
          <div className="flex flex-col h-full">
            {/* Big Display Title */}
            <div className="px-4 py-3 text-center border-b border-[#ECE8E6] bg-[#EDE7DF]">
              {/* Removed RuneHealth heading as requested */}
            </div>
            
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#ECE8E6] bg-[#EDE7DF]">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#7A8084]" />
                <h2 className="font-heading text-xl font-normal text-[#7A8084]">Rune Assistant</h2>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-[var(--font-albert-sans)] text-[10px] font-light text-[#7A8084]">
                    (Model: {currentModel ? (currentModel.provider === "gpt-4-turbo" ? "GPT-4 Turbo" : "Claude 3") : "Unknown"})
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      // Implement model toggle logic here
                    }}
                    className="h-8 w-8 text-[#7A8084] hover:text-[#865C69]"
                  >
                    <RefreshCcw className="h-3 w-3" />
                  </Button>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Model indicator */}
            {currentModel && (
              <div className="px-4 py-1 bg-[#EDE7DF] border-b border-[#ECE8E6] flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Settings className="h-3 w-3 text-[#7A8084]" />
                  <span className="font-[var(--font-albert-sans)] text-[10px] font-bold text-[#7A8084]">
                    AI Model:
                  </span>
                </div>
                <Badge 
                  variant="outline" 
                  className="bg-[#ECE8E6]/20 text-[#7A8084] border-[#7A8084]/50 font-[var(--font-albert-sans)] text-[10px]"
                >
                  {currentModel.provider.charAt(0).toUpperCase() + currentModel.provider.slice(1)} | {currentModel.model}
                </Badge>
              </div>
            )}

            {/* Lab data context badge & panel toggle */}
            <div className="flex gap-2 px-4 py-2 bg-[#EDE7DF]">
              {labContext?.hasResults && (
                <Badge 
                  variant="outline" 
                  className="bg-[#ECE8E6]/20 text-[#7A8084] hover:bg-[#ECE8E6]/30 cursor-pointer transition-colors border-[#7A8084] font-[var(--font-albert-sans)] text-[10px] font-light"
                  onClick={() => setShowLabPanel(!showLabPanel)}
                >
                  <Beaker className="h-3 w-3 mr-1" />
                  Lab Data
                </Badge>
              )}
              
              {hasSurveyData && (
                <Badge 
                  variant="outline" 
                  className="bg-[#ECE8E6]/20 text-[#7A8084] hover:bg-[#ECE8E6]/30 cursor-pointer transition-colors border-[#7A8084] font-[var(--font-albert-sans)] text-[10px] font-light"
                  onClick={() => setShowSurveyPanel(!showSurveyPanel)}
                >
                  <ClipboardList className="h-3 w-3 mr-1" />
                  Survey Data
                </Badge>
              )}
            </div>

            {/* Lab Context Panel (conditionally shown) */}
            {showLabPanel && labContext?.hasResults && (
              <div className="p-3 bg-[#ECE8E6]/10 border-b border-[#ECE8E6] font-[var(--font-albert-sans)] text-[10px]">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-heading text-base font-normal text-[#7A8084]">Lab Results Summary</h4>
                  <span className="font-[var(--font-albert-sans)] text-[10px] font-light text-[#7A8084]/70">{labContext.report?.testDate}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-white p-2 rounded border border-[#ECE8E6]">
                    <div className="text-[#7A8084]/80 font-[var(--font-albert-sans)] text-[10px] font-light">Total Biomarkers</div>
                    <div className="text-[#7A8084] font-[var(--font-albert-sans)] text-sm font-normal">{labContext.biomarkers?.total}</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-[#ECE8E6]">
                    <div className="text-[#7A8084]/80 font-[var(--font-albert-sans)] text-[10px] font-light">Abnormal Results</div>
                    <div className="text-[#7A8084] font-[var(--font-albert-sans)] text-sm font-normal">{labContext.biomarkers?.abnormal}</div>
                  </div>
                </div>
                {labContext.biomarkers?.abnormal && labContext.biomarkers.abnormal > 0 && (
                  <div className="mb-2">
                    <div className="text-[#7A8084]/80 mb-1 font-[var(--font-albert-sans)] text-[10px] font-bold">Abnormal Biomarkers:</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(labContext.biomarkers.byCategory).flatMap(([category, biomarkers]) => 
                        biomarkers
                          .filter(b => b.in_range === false)
                          .map(b => (
                            <Badge key={b.name} variant="outline" className="bg-white border-[#7923C]/30 text-[#7923C] font-[var(--font-albert-sans)] text-[10px] font-light">
                              {b.name}
                            </Badge>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Survey Panel */}
            {showSurveyPanel && hasSurveyData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-[#ECE8E6] bg-[#ECE8E6]/10"
              >
                <div className="p-4">
                  <h3 className="font-heading text-base font-normal text-[#7A8084] mb-2 flex items-center">
                    <ClipboardList className="h-4 w-4 mr-1 text-[#437D4D]" />
                    Health Survey Data
                  </h3>
                  
                  <div className="font-[var(--font-albert-sans)] text-[10px] text-[#7A8084] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-light">Survey Date:</span>
                      <span className="font-normal">{labContext?.survey?.completedDate}</span>
                    </div>
                    
                    {labContext?.survey?.data?.symptoms && labContext.survey.data.symptoms.length > 0 && (
                      <div>
                        <span className="font-bold text-[#7A8084]">Symptoms: </span>
                        <span className="font-light">{labContext?.survey?.data?.symptoms.join(", ")}</span>
                      </div>
                    )}
                    
                    {labContext?.survey?.data?.sleepQuality !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="font-light">Sleep Quality:</span>
                        <span className="font-normal">{labContext.survey.data.sleepQuality}/10</span>
                      </div>
                    )}
                    
                    {labContext?.survey?.data?.stressLevel !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="font-light">Stress Level:</span>
                        <span className="font-normal">{labContext.survey.data.stressLevel}/10</span>
                      </div>
                    )}
                    
                    {labContext?.survey?.data?.exerciseFrequency !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="font-light">Exercise:</span>
                        <span className="font-normal">{labContext.survey.data.exerciseFrequency} days/week</span>
                      </div>
                    )}
                    
                    {labContext?.survey?.recommendations?.ai?.summary && (
                      <div className="mt-2 pt-2 border-t border-[#ECE8E6]">
                        <p className="font-[var(--font-albert-sans)] text-[10px] italic font-light text-[#7A8084]">{labContext.survey.recommendations.ai.summary}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-[#F4F0EA]">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-[#7A8084] py-4 italic font-[var(--font-albert-sans)] text-sm">
                    No messages yet. Start a conversation!
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div 
                      key={message.id} 
                      className={cn(
                        "group relative mb-4 flex items-start", 
                        message.role === "user" ? "justify-end" : "justify-start",
                        !visibleMessages[message.id] && "opacity-0",
                        visibleMessages[message.id] && "opacity-100",
                        "transition-opacity duration-300"
                      )}
                    >
                      {message.role === "user" ? (
                        <div className="flex items-start gap-3 flex-row-reverse">
                          <Avatar className="w-8 h-8 bg-[#ECE8E6]/30 text-[#7A8084]">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>You</AvatarFallback>
                          </Avatar>
                          <div className="text-sm text-[#3A3A3A] px-3 py-2 bg-[#F4F2F1] rounded-[4px]">
                            {formatMessage(message.content)}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 flex flex-col">
                          {splitMessage(message.content).map((chunk, chunkIndex) => {
                            const contentType = getMessageStyle(chunk);
                            const formattedChunk = formatMessage(chunk);
                            
                            return (
                              <div
                                key={`${message.id}-${chunkIndex}`}
                                className="flex items-start gap-3 group"
                              >
                                {chunkIndex === 0 && (
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Avatar-7Wuy3DH9iB7mlmqBrV9FA7z6JagBfk.png" />
                                    <AvatarFallback>AI</AvatarFallback>
                                  </Avatar>
                                )}
                                {chunkIndex > 0 && <div className="w-8" />}
                                <div className="relative">
                                  <div
                                    className={cn(
                                      "text-sm text-[#3A3A3A] px-3 py-2 rounded-[4px]",
                                      getMessageStyleClasses(contentType)
                                    )}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => copyToClipboard(chunk, `${message.id}-${chunkIndex}`)}
                                      title="Copy to clipboard"
                                    >
                                      {copiedMessageId === `${message.id}-${chunkIndex}` ? (
                                        <Check className="h-3 w-3 text-[#437D4D]" />
                                      ) : (
                                        <Copy className="h-3 w-3 text-[#7A8084]" />
                                      )}
                                    </Button>
                                    {formattedChunk}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-[#ECE8E6] bg-white">
              <form onSubmit={handleFormSubmit} className="flex gap-2">
                <Input
                  placeholder="Type your message... (or /model to check AI model)"
                  value={input}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="flex-1 border-[#ECE8E6] focus-visible:ring-[#CC7756] font-[var(--font-albert-sans)] text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      if (input.trim()) {
                        handleFormSubmit(e as any);
                      }
                      e.preventDefault();
                    }
                  }}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={isLoading || !input.trim()} 
                  className={buttonStyles.primary}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <div className="mt-2 font-[var(--font-albert-sans)] text-[10px] font-light text-[#7A8084] flex items-center justify-between">
                <div className="flex items-center">
                  <BadgeInfo className="h-3 w-3 mr-1" />
                  <span>
                    {currentModel ? (
                      <>
                        <span className="font-medium">{currentModel.provider.charAt(0).toUpperCase() + currentModel.provider.slice(1)}</span> has access to
                      </>
                    ) : (
                      <>AI has access to</>
                    )}
                  </span>
                  {labContext?.hasResults && (
                    <span className="ml-1">
                      lab data
                      {currentReportId && <span className="text-green-700 ml-1">(ID: {currentReportId.substring(0, 8)}...)</span>}
                    </span>
                  )}
                  {labContext?.hasResults && hasSurveyData && <span className="mx-1">+</span>}
                  {hasSurveyData && <span className="ml-1">health survey</span>}
                </div>
                {(messages.length > 0) && (
                  <Button 
                    size="sm" 
                    className="h-6 font-[var(--font-albert-sans)] text-[10px] font-bold text-[#7A8084] hover:text-[#CC7756]"
                    onClick={() => setMessages([])}
                  >
                    Clear chat
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </TooltipProvider>
  )
}

