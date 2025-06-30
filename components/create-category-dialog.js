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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createCategory } from "@/services/api/category/index"
import toast from "react-hot-toast"
import { useMail } from "@/context/mailContext"

const colorOptions = [
    { name: "Red", value: "bg-red-500" },
    { name: "Blue", value: "bg-blue-500" },
    { name: "Green", value: "bg-green-500" },
    { name: "Yellow", value: "bg-yellow-500" },
    { name: "Purple", value: "bg-purple-500" },
    { name: "Pink", value: "bg-pink-500" },
    { name: "Gray", value: "bg-gray-500" },
    { name: "Orange", value: "bg-orange-500" },
    { name: "Cyan", value: "bg-cyan-500" },
    { name: "Teal", value: "bg-teal-500" },
    { name: "Indigo", value: "bg-indigo-500" },
]

export function CreateCategoryDialog({ open, onOpenChange }) {
    const [categoryName, setCategoryName] = React.useState("")
    const [selectedColor, setSelectedColor] = React.useState("bg-blue-500")
    const { setCategories } = useMail()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (categoryName.trim()) {
            // Here you would typically add the category to your state/database
            try {
                // Call the API to create the category
                const response = await createCategory({
                    name: categoryName,
                    color: selectedColor
                }).then((res) => setCategories((prev) => [...prev, res?.category]))
                toast.success("Category created successfully!")
                // Reset form
                setCategoryName("")
                setSelectedColor("bg-blue-500")
                // Close dialog
                onOpenChange(false)
            } catch (error) {
                toast.error("Failed to create category. Please try again.")
            }
        }
    }

    const handleClose = () => {
        setCategoryName("")
        setSelectedColor("bg-blue-500")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                    <DialogDescription>
                        Add a new category to organize your emails. Choose a name and color for your category.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category-name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="category-name"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                placeholder="Enter category name"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category-color" className="text-right">
                                Color
                            </Label>
                            <Select value={selectedColor} onValueChange={setSelectedColor}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-3 w-3 rounded-full ${selectedColor}`} />
                                            <span>{colorOptions.find((c) => c.value === selectedColor)?.name}</span>
                                        </div>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {colorOptions.map((color) => (
                                        <SelectItem key={color.value} value={color.value}>
                                            <div className="flex items-center gap-2">
                                                <div className={`h-3 w-3 rounded-full ${color.value}`} />
                                                <span>{color.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Create Category</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
