"use client"

import * as React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarContextProps {
  state: "expanded" | "collapsed"
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextProps>({
  state: "expanded",
  toggle: () => {},
})

interface SidebarProviderProps {
  children: ReactNode
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [state, setState] = useState<"expanded" | "collapsed">("expanded")

  const toggle = () => {
    setState((prevState) => (prevState === "expanded" ? "collapsed" : "expanded"))
  }

  return <SidebarContext.Provider value={{ state, toggle }}>{children}</SidebarContext.Provider>
}

export const useSidebar = () => useContext(SidebarContext)

const Sidebar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-sand-200 bg-white transition-transform duration-300",
        useSidebar().state === "collapsed" ? "-translate-x-full" : "",
        className,
      )}
      {...props}
    />
  ),
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex h-16 items-center px-4", className)} {...props} />
  ),
)
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1 overflow-y-auto p-4", className)} {...props} />
  ),
)
SidebarContent.displayName = "SidebarContent"

const SidebarMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex-1 space-y-1 p-4", className)} {...props} />,
)
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("", className)} {...props} />,
)
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button> & { isActive?: boolean }
>(({ className, isActive, ...props }, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    className={cn(
      "flex w-full items-center justify-start gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-sand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-950 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-sand-100 data-[state=open]:text-sand-900",
      isActive && "bg-sand-100 text-sand-900",
      className,
    )}
    {...props}
  />
))
SidebarMenuButton.displayName = "SidebarMenuButton"

// Replace CollapsibleTrigger with a simple button that uses the sidebar context
const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, ...props }, ref) => {
    const { toggle } = useSidebar()
    return <Button ref={ref} type="button" onClick={toggle} className={cn("", className)} {...props} />
  },
)
SidebarTrigger.displayName = "SidebarTrigger"

export { Sidebar, SidebarContent, SidebarHeader, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton }

