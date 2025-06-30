"use client"

import { useState } from "react"
import { Send, Paperclip, Sparkles, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import toast from "react-hot-toast"
import { useMail } from "@/context/mailContext"
import { useEffect } from "react"
import { generateEmailBody } from "@/services/api/mail/index"
import { sendEmail } from "@/services/api/mail/index"

// Email input component for handling multiple recipients
function EmailInput({ label, placeholder, emails, onEmailsChange, onToggle, showField = true }) {
  const [inputValue, setInputValue] = useState("")

  const addEmail = (email) => {
    const trimmedEmail = email.trim()
    if (trimmedEmail && isValidEmail(trimmedEmail) && !emails.includes(trimmedEmail)) {
      onEmailsChange([...emails, trimmedEmail])
    }
    setInputValue("")
  }

  const removeEmail = (emailToRemove) => {
    onEmailsChange(emails.filter(email => email !== emailToRemove))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addEmail(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '' && emails.length > 0) {
      removeEmail(emails[emails.length - 1])
    }
  }

  const handleBlur = () => {
    if (inputValue.trim()) {
      addEmail(inputValue)
    }
  }

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  if (!showField) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {onToggle && (
          <Button variant="ghost" size="sm" onClick={onToggle} className="text-xs">
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-1 p-2 border rounded-md min-h-[40px] focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
        {emails.map((email, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {email}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeEmail(email)}
              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-2 w-2" />
            </Button>
          </Badge>
        ))}
        <Input
          placeholder={emails.length === 0 ? placeholder : ""}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="border-0 shadow-none p-0 h-6 flex-1 min-w-[120px] focus-visible:ring-0"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Press Enter or comma to add multiple emails
      </p>
    </div>
  )
}

export function ComposeDialog({ open, onOpenChange }) {
  const { mailAccounts } = useMail()
  const [formData, setFormData] = useState({
    from: "",
    to: [],
    cc: [],
    bcc: [],
    subject: "",
    message: "",
  })

  useEffect(() => {
    if (mailAccounts.length > 0 && !formData.from) {
      setFormData(prev => ({
        ...prev,
        from: mailAccounts[0].email,
      }))
    }
  }, [mailAccounts])

  const [attachments, setAttachments] = useState([])
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [isAiGenerating, setIsAiGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const emailAccounts = mailAccounts.map((account) => account.email)

  const handleAiGenerate = async () => {
    setIsAiGenerating(true)
    try {
      const emailmessage = await generateEmailBody(formData.subject)
      console.log(emailmessage)
      setFormData((prev) => ({
        ...prev,
        message: emailmessage,
      }))
    } catch (e) {
      console.error("AI generation error:", e)
      toast.error("Failed to generate email content. Please try again.")
    } finally {
      setIsAiGenerating(false)
    }
  }

  const resetForm = () => {
    setFormData({
      from: emailAccounts[0] || "",
      to: [],
      cc: [],
      bcc: [],
      subject: "",
      message: "",
    })
    setAttachments([])
    setShowCc(false)
    setShowBcc(false)
  }

  const handleSend = async () => {
    // Validate that at least one recipient is provided
    if (formData.to.length === 0) {
      toast.error("Please add at least one recipient to send the email.")
      return
    }

    const fromMailId = mailAccounts.find(account => account.email === formData.from)?.id
    if (!fromMailId) {
      toast.error("Selected email account not found. Please select a valid account.")
      return
    }

    setIsSending(true)

    // Convert arrays to comma-separated strings for submission
    const submissionData = {
      to: formData.to.join(','),
      cc: formData.cc.join(','),
      bcc: formData.bcc.join(','),
      subject: formData.subject,
      message: formData.message,
      attachments: attachments
    }

    console.log("Sending email:", submissionData)
    console.log("From mail ID:", fromMailId)

    try {
      const response = await sendEmail(fromMailId, submissionData)
      if (!response || !response.success) {
        toast.success(`Email sent successfully to!`)
      }

      // Reset form after successful send
      resetForm()

      // Close dialog after a short delay to show the toast
      setTimeout(() => {
        onOpenChange(false)
      }, 1500)

    } catch (error) {
      console.error("Send mail error:", error)

      // Show error toast with more specific error message if available
      const errorMessage = error?.message || error?.toString() || "An unexpected error occurred while sending the email."

      toast.error(`Failed to send email: ${errorMessage}`)
    } finally {
      setIsSending(false)
    }
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files || [])
    setAttachments((prev) => [...prev, ...files])
  }

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* From Field */}
          <div className="space-y-2">
            <Label htmlFor="from">From</Label>
            <Select value={formData.from} onValueChange={(value) => setFormData((prev) => ({ ...prev, from: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {emailAccounts.map((account) => (
                  <SelectItem key={account} value={account}>
                    {account}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* To Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>To</Label>
              <div className="flex gap-2">
                {!showCc && (
                  <Button variant="ghost" size="sm" onClick={() => setShowCc(true)} className="text-xs">
                    Cc
                  </Button>
                )}
                {!showBcc && (
                  <Button variant="ghost" size="sm" onClick={() => setShowBcc(true)} className="text-xs">
                    Bcc
                  </Button>
                )}
              </div>
            </div>
            <EmailInput
              label=""
              placeholder="recipient@example.com"
              emails={formData.to}
              onEmailsChange={(emails) => setFormData(prev => ({ ...prev, to: emails }))}
            />
          </div>

          {/* CC Field */}
          <EmailInput
            label="Cc"
            placeholder="cc@example.com"
            emails={formData.cc}
            onEmailsChange={(emails) => setFormData(prev => ({ ...prev, cc: emails }))}
            onToggle={() => setShowCc(false)}
            showField={showCc}
          />

          {/* BCC Field */}
          <EmailInput
            label="Bcc"
            placeholder="bcc@example.com"
            emails={formData.bcc}
            onEmailsChange={(emails) => setFormData(prev => ({ ...prev, bcc: emails }))}
            onToggle={() => setShowBcc(false)}
            showField={showBcc}
          />

          {/* Subject Field */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Email subject"
              value={formData.subject}
              onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          {/* message Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="message">Message</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAiGenerate}
                disabled={isAiGenerating}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 hover:from-purple-700 hover:to-blue-700"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {isAiGenerating ? "Generating..." : "Let AI do it"}
              </Button>
            </div>
            <Textarea
              id="message"
              placeholder="Write your message here..."
              className="min-h-[200px]"
              value={formData.message}
              onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Attachments</Label>
              <div>
                <input type="file" multiple onChange={handleFileUpload} className="hidden" id="file-upload" />
                <Button variant="outline" size="sm" onClick={() => document.getElementById("file-upload")?.click()}>
                  <Paperclip className="h-3 w-3 mr-1" />
                  Attach Files
                </Button>
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {file.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Save Draft
              </Button>
              <Button variant="outline" size="sm">
                Schedule
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Send className="h-4 w-4 mr-1" />
                {isSending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}