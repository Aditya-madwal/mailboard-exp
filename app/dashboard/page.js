"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { EmailSidebar } from "@/components/email-sidebar"
import { TodoKanban } from "@/components/todo-kanban"
import { useSidebar } from "@/components/ui/sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { useState, useEffect } from "react"
import { useMail } from "@/context/mailContext"
import axios from 'axios'

export default function Dashboard() {
  const { open, state } = useSidebar()
  const [showTodoBoard, setShowTodoBoard] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-hide todo board on mobile when sidebar opens
  useEffect(() => {
    if (isMobile && open) {
      setShowTodoBoard(false)
    }
  }, [open, isMobile])

  return (
    <>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        {/* Header - Fixed at top */}
        <div className="fixed top-0 right-0 z-50 bg-background border-b transition-all duration-200 left-0 md:left-[var(--sidebar-width)] w-screen md:w-[calc(100vw-var(--sidebar-width))]">
          <Header onToggleTodoBoard={() => setShowTodoBoard(!showTodoBoard)} showTodoBoard={showTodoBoard} />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 pt-16 overflow-hidden">
          {/* Email Sidebar - Hidden on mobile when todo board is open */}
          <div 
            className={`
              fixed top-16 bottom-0 bg-background border-r z-40 transition-all duration-200 
              ${isMobile ? 'w-full' : 'w-[320px]'} 
              left-0 md:left-[var(--sidebar-width)]
              ${isMobile && showTodoBoard ? 'hidden' : 'block'}
            `}
          >
            <EmailSidebar />
          </div>

          {/* Todo Board - Takes full width on mobile, slides in from right */}
          <div 
            className={`
              fixed top-16 bottom-0 bg-background z-30 transition-all duration-300 ease-in-out
              ${isMobile ? 'w-full' : 'w-[calc(100vw-320px-var(--sidebar-width))]'}
              ${isMobile ? 
                (showTodoBoard ? 'left-0' : 'left-full') : 
                'left-[320px] md:left-[calc(320px+var(--sidebar-width))]'
              }
              ${!isMobile || showTodoBoard ? 'block' : 'hidden'}
            `}
          >
            <TodoKanban />
          </div>
        </div>
      </SidebarInset>
    </>
  )
}

async function getAuth() {
  try {
    const { data } = await axios.get("/api/auth/showme")
    return { user: data, error: null }
  } catch (error) {
    console.error('Auth request failed:', error)
    return {
      user: null,
      error: error.response?.data?.message || 'Authentication failed'
    }
  }
}