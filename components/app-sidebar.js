"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Plus, Settings, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ConnectEmailDialog } from "@/components/connect-email-dialog"
import { CreateCategoryDialog } from "@/components/create-category-dialog"
import { CategoryOnboardingModal } from "@/components/category-onboarding-modal"
import axios from "axios"
import { fetchEmailAccounts } from "@/services/api/mail/accounts"
import { getAllCategories, createCategory } from "@/services/api/category/index"
import { logoutUser } from "@/services/api/auth/index"
import { useMail } from "@/context/mailContext"
import { SettingsModal } from "@/components/settings-modal"
import { toast } from "react-hot-toast"

export function AppSidebar() {
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const [createCategoryDialogOpen, setCreateCategoryDialogOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [categoryOnboardingOpen, setCategoryOnboardingOpen] = useState(false)
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const { mailAccounts, setMailAccounts, categories, setCategories, emails, labels } = useMail()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const activeCategory = searchParams.get('category')
  const activeLabel = searchParams.get('label')

  // Add debug logging
  console.log('Categories from context:', categories)
  console.log('Categories loaded:', categoriesLoaded)
  console.log('Category onboarding open:', categoryOnboardingOpen)

  const updateUrlParams = (newCategory, newLabel) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newCategory === null) params.delete('category')
    else params.set('category', newCategory)

    if (newLabel === null) params.delete('label')
    else params.set('label', newLabel)

    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.push(newUrl)
  }

  const handleCategoryClick = (categoryName) => {
    if (activeCategory === categoryName) updateUrlParams(null, activeLabel)
    else updateUrlParams(categoryName, activeLabel)
  }

  const handleLabelClick = (labelName) => {
    if (activeLabel === labelName.toLowerCase()) updateUrlParams(activeCategory, null)
    else updateUrlParams(activeCategory, labelName.toLowerCase())
  }

  useEffect(() => {
    async function initAccounts() {
      try {
        const accounts = await fetchEmailAccounts()
        setMailAccounts(accounts)
      } catch (error) {
        console.error("Error fetching email accounts:", error)
      }
    }

    async function initCategories() {
      try {
        console.log('Fetching categories...')
        const fetchedCategories = await getAllCategories()
        console.log('Fetched categories:', fetchedCategories)

        // Fix the logic here - the issue was with the .then() callback
        if (fetchedCategories.length === 0) {
          setCategoryOnboardingOpen(true)
        }

        setCategories(fetchedCategories)
        setCategoriesLoaded(true)
      } catch (error) {
        console.error("Error fetching categories:", error)
        setCategoriesLoaded(true)
        setCategoryOnboardingOpen(true)
      }
    }

    initAccounts()
    initCategories()
  }, [setMailAccounts, setCategories])

  useEffect(() => {
    if (categoriesLoaded && categories && categories.length > 0) {
      setCategoryOnboardingOpen(false)
    }
  }, [categories, categoriesLoaded])

  const handleOnboardingComplete = async (selectedCategories) => {
    try {
      const newCreated = []
      for (const categoryData of selectedCategories) {
        const newCategory = await createCategory(categoryData)
        newCreated.push(newCategory)
      }
      const refreshed = await getAllCategories()
      setCategories(refreshed)
      toast.success("Categories created successfully")
      setCategoryOnboardingOpen(false)
    } catch (error) {
      console.error("Create category failed:", error)
      toast.error("Failed to create some or all categories")
    }
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
      localStorage.clear()
      sessionStorage.clear()
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict'
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict'
      document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict'
      toast.success("Logged out successfully")
      router.push('/login')
    } catch (error) {
      console.error("Logout error:", error)
      localStorage.clear()
      sessionStorage.clear()
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict'
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict'
      document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict'
      toast.success("Logged out successfully")
      router.push('/login')
    }
  }

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true)
  }

  const confirmLogout = () => {
    setLogoutDialogOpen(false)
    handleLogout()
  }

  // Add better filtering for categories
  const validCategories = categories?.filter(c => c && c.name && c._id) || []
  console.log('Valid categories to render:', validCategories)

  return (
    <>
      <Sidebar className="bg-black z-70 border-r">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center">
              <img src="/icon.png" alt="Icon" className="w-fit h-fit object-cover rounded-lg" />
            </div>
            <span className="text-lg font-semibold">MailBoard</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <div className="flex items-center justify-between">
              <SidebarGroupLabel>Email Accounts</SidebarGroupLabel>
              <Button variant="ghost" size="sm" onClick={() => setConnectDialogOpen(true)} className="h-6 w-6 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {mailAccounts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-4 text-muted-foreground">
                    <p className="text-sm font-medium">No accounts connected</p>
                    <p className="text-xs opacity-75 text-center">Connect your email accounts to get started</p>
                  </div>
                ) : mailAccounts.map((account) => (
                  <SidebarMenuItem key={account.id}>
                    <SidebarMenuButton className="h-12 justify-start">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={account.avatar} />
                        <AvatarFallback>{account.name?.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <span className="text-sm font-medium truncate">{account.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{account.email}</span>
                      </div>
                      <Badge variant="secondary" className="ml-auto text-xs w-fit">
                        {emails?.filter(e => e.isUnread && e.gmailAccount === account.id).length || 0}
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <div className="flex items-center justify-between w-full">
              <SidebarGroupLabel>Categories</SidebarGroupLabel>
              <Button variant="ghost" size="sm" onClick={() => setCreateCategoryDialogOpen(true)} className="h-6 w-6 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Add debug info */}
                {!categoriesLoaded && (
                  <div className="flex flex-col items-center justify-center p-4 text-muted-foreground">
                    <p className="text-sm font-medium">Loading categories...</p>
                  </div>
                )}

                {categoriesLoaded && validCategories.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-4 text-muted-foreground">
                    <p className="text-sm font-medium">No categories added</p>
                    <p className="text-xs opacity-75 text-center">Add categories to get started</p>
                  </div>
                )}

                {validCategories.map(category => (
                  <SidebarMenuItem key={category._id || category.id}>
                    <SidebarMenuButton
                      className={`justify-start cursor-pointer transition-colors ${activeCategory === category.name ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      <div className={`h-3 w-3 rounded-full ${category.color || 'bg-gray-400'}`} />
                      <span>{category.name}</span>
                      <Badge variant={activeCategory === category.name ? "default" : "secondary"} className="ml-auto">
                        {emails?.filter(e => e.UserCategory === category._id).length || 0}
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Labels</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {labels?.map(label => (
                  <SidebarMenuItem key={label.name}>
                    <SidebarMenuButton
                      className={`justify-start cursor-pointer transition-colors ${activeLabel === label.name.toLowerCase() ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
                      onClick={() => handleLabelClick(label.name)}
                    >
                      <div className={`h-3 w-3 rounded-full ${label.color}`} />
                      <span>{label.name}</span>
                      <Badge variant={activeLabel === label.name.toLowerCase() ? "default" : "secondary"} className="ml-auto">
                        {emails?.filter(e => e.gmailCategory?.toLowerCase() === label.name.toLowerCase()).length || 0}
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )) || []}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <SidebarMenu>
            <SidebarMenuItem className="hover:bg-accent hover:text-accent-foreground">
              <SidebarMenuButton onClick={() => setSettingsOpen(true)}>
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="hover:bg-red-100 hover:text-red-700"
                onClick={handleLogoutClick}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <ConnectEmailDialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen} />
      <CreateCategoryDialog open={createCategoryDialogOpen} onOpenChange={setCreateCategoryDialogOpen} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <CategoryOnboardingModal
        open={categoryOnboardingOpen}
        onOpenChange={setCategoryOnboardingOpen}
        onComplete={handleOnboardingComplete}
      />

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out? You'll need to log in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}