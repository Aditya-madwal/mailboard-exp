"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Sparkles } from "lucide-react"

const suggestedCategories = [
    { name: "Work", color: "bg-blue-500" },
    { name: "Personal", color: "bg-green-500" },
    { name: "Finance", color: "bg-yellow-500" },
    { name: "Travel", color: "bg-purple-500" },
    { name: "Shopping", color: "bg-pink-500" },
    { name: "Health", color: "bg-red-500" },
    { name: "Education", color: "bg-indigo-500" },
    { name: "Social", color: "bg-cyan-500" },
]

const colorOptions = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-red-500",
    "bg-orange-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-cyan-500",
]

export function CategoryOnboardingModal({ open, onOpenChange, onComplete }) {
    const [selectedCategories, setSelectedCategories] = React.useState([])
    const [customCategory, setCustomCategory] = React.useState("")
    const [customColor, setCustomColor] = React.useState("bg-blue-500")

    const toggleSuggestedCategory = (category) => {
        setSelectedCategories((prev) => {
            const exists = prev.find((c) => c.name === category.name)
            if (exists) {
                return prev.filter((c) => c.name !== category.name)
            } else {
                return [...prev, category]
            }
        })
    }

    const addCustomCategory = () => {
        if (customCategory.trim() && !selectedCategories.find((c) => c.name === customCategory)) {
            setSelectedCategories((prev) => [...prev, { name: customCategory, color: customColor }])
            setCustomCategory("")
            setCustomColor("bg-blue-500")
        }
    }

    const removeCategory = (categoryName) => {
        setSelectedCategories((prev) => prev.filter((c) => c.name !== categoryName))
    }

    const handleComplete = () => {
        // Here you would save the categories to your state/database
        console.log("Selected categories:", selectedCategories)
        onComplete(selectedCategories)
        onOpenChange(false)
    }

    const handleSkip = () => {
        onComplete([])
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                            <img src="/icon.png" alt="logo" className="rounded-lg" />
                        </div>
                        <DialogTitle className="text-xl">Welcome to MailBoard!</DialogTitle>
                    </div>
                    <DialogDescription className="text-base">
                        Let's set up your email categories to help organize your inbox. You can always add more later.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Suggested Categories */}
                    <div>
                        <h3 className="text-sm font-medium mb-3">Suggested Categories</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {suggestedCategories.map((category) => {
                                const isSelected = selectedCategories.find((c) => c.name === category.name)
                                return (
                                    <Button
                                        key={category.name}
                                        variant={isSelected ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => toggleSuggestedCategory(category)}
                                        className="justify-start h-auto py-2"
                                    >
                                        <div className={`h-3 w-3 rounded-full ${category.color} mr-2`} />
                                        {category.name}
                                    </Button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Custom Category */}
                    <div>
                        <h3 className="text-sm font-medium mb-3">Add Custom Category</h3>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input
                                    placeholder="Enter category name"
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && addCustomCategory()}
                                />
                            </div>
                            <div className="flex gap-1">
                                {colorOptions.slice(0, 5).map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setCustomColor(color)}
                                        className={`w-6 h-6 rounded-full ${color} border-2 ${customColor === color ? "border-foreground" : "border-transparent"
                                            }`}
                                    />
                                ))}
                            </div>
                            <Button size="sm" onClick={addCustomCategory} disabled={!customCategory.trim()}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Selected Categories */}
                    {selectedCategories.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium mb-3">Your Categories ({selectedCategories.length})</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedCategories.map((category) => (
                                    <Badge key={category.name} variant="secondary" className="flex items-center gap-2 px-3 py-1">
                                        <div className={`h-2 w-2 rounded-full ${category.color}`} />
                                        {category.name}
                                        <button onClick={() => removeCategory(category.name)} className="ml-1 hover:text-destructive">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between">
                    <Button variant="ghost" onClick={handleSkip}>
                        Skip for now
                    </Button>
                    <Button
                        onClick={handleComplete}
                        disabled={selectedCategories.length === 0}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                        {selectedCategories.length === 0
                            ? "Select categories to continue"
                            : `Continue with ${selectedCategories.length} ${selectedCategories.length === 1 ? "category" : "categories"}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
