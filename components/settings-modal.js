"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Mail, User, Palette, X } from "lucide-react"

// Dummy data
const dummyUser = {
    name: "Aditya Madwal",
    email: "madwaladitya@gmail.com",
    picture: "https://lh3.googleusercontent.com/a/ACg8ocLQdPFSeV3ABTIpB2REmj5OVdyYkbxOFNowODawUhukotnXKV-U=s96-c"
}

const dummyMailAccounts = [
    {
        _id: "685bb170ebaa1bff371a29a7",
        email: "madwaladitya@gmail.com",
        name: "Aditya Madwal",
        picture: "https://lh3.googleusercontent.com/a/ACg8ocLQdPFSeV3ABTIpB2REmj5OVdyYkbxOFNowODawUhukotnXKV-U=s96-c",
        createdAt: "2025-06-25T08:21:04.722Z"
    },
    {
        _id: "685c1787648970585c32839b",
        email: "work@company.com",
        name: "Work Account",
        picture: null,
        createdAt: "2025-06-25T10:15:30.123Z"
    }
]

const dummyCategories = [
    {
        _id: "685d36d8b3facef80897ec4b",
        name: "technical",
        color: "bg-yellow-500",
        createdAt: "2025-06-26T12:02:32.486Z"
    },
    {
        _id: "685d3618b3facef80897ec34",
        name: "spam",
        color: "bg-pink-500",
        createdAt: "2025-06-26T11:59:20.139Z"
    },
    {
        _id: "685d35930ed989eef165ad47",
        name: "relatives",
        color: "bg-red-500",
        createdAt: "2025-06-26T11:57:07.115Z"
    },
    {
        _id: "685d34a50ed989eef165ad44",
        name: "youtube",
        color: "bg-purple-500",
        createdAt: "2025-06-26T11:53:09.570Z"
    },
    {
        _id: "685c0ace7f5787c4f83d0352",
        name: "personal",
        color: "bg-blue-500",
        createdAt: "2025-06-25T14:42:22.112Z"
    },
    {
        _id: "685c0ac57f5787c4f83d034f",
        name: "office",
        color: "bg-blue-500",
        createdAt: "2025-06-25T14:42:13.761Z"
    }
]

const colorOptions = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-cyan-500",
    "bg-orange-500",
    "bg-emerald-500"
]

export function SettingsModal({ open, onOpenChange }) {
    const [user, setUser] = useState(dummyUser)
    const [mailAccounts, setMailAccounts] = useState(dummyMailAccounts)
    const [categories, setCategories] = useState(dummyCategories)
    const [newCategoryName, setNewCategoryName] = useState("")
    const [newCategoryColor, setNewCategoryColor] = useState("bg-blue-500")
    const [showAddCategory, setShowAddCategory] = useState(false)
    const [deletingAccountId, setDeletingAccountId] = useState(null)
    const [deletingCategoryId, setDeletingCategoryId] = useState(null)

    const getInitials = (name) => {
        if (!name) return "U";
        const words = name.split(" ").filter(Boolean).slice(0, 2);
        return words
            .map(word => {
                for (let i = 0; i < word.length; i++) {
                    if (/[a-zA-Z0-9]/.test(word[i])) return word[i];
                }
                return "";
            })
            .join("")
            .toUpperCase();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const handleDeleteAccount = (accountId) => {
        setDeletingAccountId(accountId)
        // Simulate API call
        setTimeout(() => {
            setMailAccounts(prev => prev.filter(acc => acc._id !== accountId))
            setDeletingAccountId(null)
        }, 1000)
    }

    const handleDeleteCategory = (categoryId) => {
        setDeletingCategoryId(categoryId)
        // Simulate API call
        setTimeout(() => {
            setCategories(prev => prev.filter(cat => cat._id !== categoryId))
            setDeletingCategoryId(null)
        }, 1000)
    }

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return

        const newCategory = {
            _id: Date.now().toString(),
            name: newCategoryName.trim(),
            color: newCategoryColor,
            createdAt: new Date().toISOString()
        }

        setCategories(prev => [newCategory, ...prev])
        setNewCategoryName("")
        setNewCategoryColor("bg-blue-500")
        setShowAddCategory(false)
    }

    const handleAddGmailAccount = () => {
        // Simulate OAuth flow
        console.log("Opening Gmail OAuth flow...")
        // This would typically open a popup or redirect to Google OAuth
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Settings
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="profile" className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="accounts">Mail Accounts</TabsTrigger>
                        <TabsTrigger value="categories">Categories</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto mt-6">
                        <TabsContent value="profile" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>
                                        Your account details and preferences
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src={user.picture} />
                                            <AvatarFallback className="text-lg">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-lg">{user.name}</h3>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Display Name</Label>
                                            <Input
                                                id="name"
                                                value={user.name}
                                                onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                value={user.email}
                                                disabled
                                                className="bg-muted"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Email cannot be changed
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="accounts" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Connected Gmail Accounts</CardTitle>
                                            <CardDescription>
                                                Manage your connected Gmail accounts
                                            </CardDescription>
                                        </div>
                                        <Button onClick={handleAddGmailAccount} size="sm">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Account
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {mailAccounts.map((account) => (
                                            <div
                                                key={account._id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={account.picture} />
                                                        <AvatarFallback>
                                                            {getInitials(account.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-medium">{account.name}</h4>
                                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{account.email}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Connected on {formatDate(account.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteAccount(account._id)}
                                                    disabled={deletingAccountId === account._id}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    {deletingAccountId === account._id ? (
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="categories" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Email Categories</CardTitle>
                                            <CardDescription>
                                                Organize your emails with custom categories
                                            </CardDescription>
                                        </div>
                                        <Button
                                            onClick={() => setShowAddCategory(true)}
                                            size="sm"
                                            disabled={showAddCategory}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Category
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {showAddCategory && (
                                            <div className="p-4 border rounded-lg bg-accent/20 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium">Create New Category</h4>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setShowAddCategory(false)
                                                            setNewCategoryName("")
                                                            setNewCategoryColor("bg-blue-500")
                                                        }}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="grid gap-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="categoryName">Category Name</Label>
                                                        <Input
                                                            id="categoryName"
                                                            placeholder="Enter category name"
                                                            value={newCategoryName}
                                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label>Color</Label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {colorOptions.map((color) => (
                                                                <button
                                                                    key={color}
                                                                    onClick={() => setNewCategoryColor(color)}
                                                                    className={`h-8 w-8 rounded-full ${color} border-2 transition-all ${newCategoryColor === color
                                                                            ? "border-foreground scale-110"
                                                                            : "border-transparent hover:scale-105"
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setShowAddCategory(false)
                                                            setNewCategoryName("")
                                                            setNewCategoryColor("bg-blue-500")
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={handleAddCategory}
                                                        disabled={!newCategoryName.trim()}
                                                    >
                                                        Create Category
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {categories.map((category) => (
                                            <div
                                                key={category._id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-4 w-4 rounded-full ${category.color}`} />
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-medium capitalize">{category.name}</h4>
                                                            <Palette className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Created on {formatDate(category.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteCategory(category._id)}
                                                    disabled={deletingCategoryId === category._id}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    {deletingCategoryId === category._id ? (
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}