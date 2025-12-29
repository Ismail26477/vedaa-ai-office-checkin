"use client"

import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/contexts/AuthContext"
import { AttendanceProvider } from "@/contexts/AttendanceContext"
import Index from "@/views/Index"

const queryClient = new QueryClient()

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AttendanceProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Index />
          </TooltipProvider>
        </AttendanceProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
