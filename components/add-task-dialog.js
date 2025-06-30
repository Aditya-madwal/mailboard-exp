"use client"

import { useState } from "react"
import { Calendar, Link, Tag } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { createTask } from "@/services/api/todo"
import { useMail } from "@/context/mailContext"

const priorities = [
  { value: "Low", label: "Low", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "Medium", label: "Medium", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  { value: "High", label: "High", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
]

const statuses = [
  { value: "To Do", label: "To Do" },
  { value: "In Progress", label: "In Progress" },
  { value: "Review", label: "Review" },
  { value: "Done", label: "Done" },
]

const predefinedTags = ["Work", "Personal", "Finance", "Marketing", "Development", "Review", "Urgent", "Meeting"]

export function AddTaskDialog({ open, onOpenChange }) {
  const { tasks, setTasks } = useMail()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "To Do",
    priority: "Medium",
    dueDate: "",
    tags: [],
    relatedLinks: [],
  })
  const [newTag, setNewTag] = useState("")
  const [newLink, setNewLink] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("Creating task:", formData)
    const newtask = await createTask(formData)
    console.log(newtask)
    setTasks([...tasks, newtask])
    onOpenChange(false)
    setFormData({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
      tags: [],
      relatedLinks: [],
    })
  }

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
    }
    setNewTag("")
  }

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== tagToRemove) }))
  }

  const addLink = () => {
    if (newLink && !formData.relatedLinks.includes(newLink)) {
      setFormData((prev) => ({ ...prev, relatedLinks: [...prev.relatedLinks, newLink] }))
    }
    setNewLink("")
  }

  const removeLink = (linkToRemove) => {
    setFormData((prev) => ({ ...prev, relatedLinks: prev.relatedLinks.filter((link) => link !== linkToRemove) }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the task in detail..."
              className="min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${priority.color}`}>{priority.label}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            {/* <div className="space-y-2">
              <Label>Assignee</Label>
              <Select
                value={formData.assignee}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, assignee: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee">
                    {selectedAssignee && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={selectedAssignee.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {selectedAssignee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{selectedAssignee.name}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {assignees.map((assignee) => (
                    <SelectItem key={assignee.id} value={assignee.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={assignee.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {assignee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm">{assignee.name}</span>
                          <span className="text-xs text-muted-foreground">{assignee.email}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="dueDate"
                  type="datetime-local"
                  className="pl-10"
                  value={formData.dueDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeTag(tag)}
                  >
                    ×
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag(newTag))}
              />
              <Button type="button" variant="outline" onClick={() => addTag(newTag)}>
                <Tag className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {predefinedTags
                .filter((tag) => !formData.tags.includes(tag))
                .map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => addTag(tag)}
                  >
                    + {tag}
                  </Button>
                ))}
            </div>
          </div>

          {/* relatedLinks */}
          <div className="space-y-2">
            <Label>Related relatedLinks</Label>
            <div className="space-y-2">
              {formData.relatedLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                  <Link className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-sm text-blue-600 hover:underline truncate"
                  >
                    {link}
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeLink(link)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
              />
              <Button type="button" variant="outline" onClick={addLink}>
                <Link className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
