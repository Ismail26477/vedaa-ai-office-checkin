"use client"

import { Toaster } from "@/src/components/ui/toaster"
import { Toaster as Sonner } from "@/src/components/ui/sonner"
import { TooltipProvider } from "@/src/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/src/contexts/AuthContext"
import { AttendanceProvider } from "@/src/contexts/AttendanceContext"
import Index from "../src/views/Index"
import Login from "../src/views/Login"
import NotFound from "../src/views/NotFound"

const queryClient = new QueryClient()

export default function ViteAppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AttendanceProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AttendanceProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
