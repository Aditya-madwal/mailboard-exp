"use client"

import { Button } from "@/components/ui/button"
import { Search, Bell, Plus, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { ComposeDialog } from "@/components/compose-dialog"
import { useEffect, useState } from "react"
import { useMail } from "@/context/mailContext"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import axios from "axios"

export function Header() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [composeOpen, setComposeOpen] = useState(false)
  const { emails } = useMail()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [user, setUser] = useState(null)

  const updateUrlParams = (newSearch) => {
    const params = new URLSearchParams(searchParams.toString())

    if (newSearch === null || newSearch === '') {
      params.delete('search')
    } else {
      params.set('search', newSearch)
    }

    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.push(newUrl)
  }

  useEffect(() => {
    if (searchQuery === '') {
      updateUrlParams(null)
    }
  }, [searchQuery])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get("/api/auth/showme")
        setUser(data.user)
      } catch (error) {
        console.error("Failed to fetch user:", error)
      }
    }
    fetchUser()
  }, [])

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-4 px-4">
        <SidebarTrigger className="-ml-1" />

        <div className="flex flex-1 items-center gap-4">
          <form className="relative flex-1 max-w-md" onSubmit={(e) => {
            e.preventDefault()
            updateUrlParams(searchQuery)
          }}>
            <button className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search className="h-4 w-4" />
            </button>
            <Input placeholder="Search..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </form>

          <Button
            onClick={() => setComposeOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <div className="text-right mr-2">
              <div className="text-sm font-medium leading-tight">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
          )}
          <Avatar className="h-8 w-8">
            {/* <AvatarImage src={`https://api.dicebear.com/8.x/fun-emoji/svg?seed=${Math.random()}`} /> */}
            <AvatarFallback>{user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <ComposeDialog open={composeOpen} onOpenChange={setComposeOpen} />
    </>
  )
}
