"use client"

import '../globals.css'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export default function LoginLayout({ children }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                setIsLoading(true)
                const { user, error } = await getAuth()

                if (user && !error) {
                    // User is authenticated, redirect to dashboard
                    router.push('/dashboard')
                    return
                }

                // User is not authenticated, allow access to login page
                setIsAuthenticated(false)
            } catch (error) {
                console.error('Auth check failed:', error)
                // If auth check fails, assume user is not authenticated
                setIsAuthenticated(false)
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [router])

    if (isLoading || isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center w-screen">
                <div className="h-full w-full flex items-center justify-center">
                    {/* Minimal spinner: just a spinning border */}
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-muted-foreground border-t-transparent" />
                </div>
            </div>
        )
    }

    // Only render children if user is not authenticated
    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {children}
        </ThemeProvider>
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