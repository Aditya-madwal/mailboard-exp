"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import axios from 'axios'

export default function AuthWrapper({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup']
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        const { data } = await axios.get("/api/auth/showme")
        
        if (data.user) {
          setIsAuthenticated(true)
          // If user is authenticated and on a public route, redirect to dashboard
          if (isPublicRoute && pathname !== '/') {
            router.push('/dashboard')
          }
        } else {
          setIsAuthenticated(false)
          // If user is not authenticated and on a protected route, redirect to login
          if (!isPublicRoute) {
            router.push('/login')
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
        // If auth check fails and on a protected route, redirect to login
        if (!isPublicRoute) {
          router.push('/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router, isPublicRoute])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center w-screen">
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-muted-foreground border-t-transparent" />
        </div>
      </div>
    )
  }

  // Show content if:
  // 1. It's a public route (regardless of auth status)
  // 2. It's a protected route and user is authenticated
  if (isPublicRoute || isAuthenticated) {
    return children
  }

  // This shouldn't be reached due to redirects, but just in case
  return (
    <div className="min-h-screen bg-black flex items-center justify-center w-screen">
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-muted-foreground border-t-transparent" />
      </div>
    </div>
  )
}