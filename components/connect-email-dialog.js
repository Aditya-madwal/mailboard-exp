"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ConnectEmailDialog({ open, onOpenChange }) {
  const [step, setStep] = useState("select")
  const [selectedProvider, setSelectedProvider] = useState("")

  const handleConnect = () => {
    setSelectedProvider("gmail")
    setStep("oauth")

    // Simulate OAuth flow
    setTimeout(() => {
      setStep("success")
    }, 2000)
  }

  const handleClose = () => {
    setStep("select")
    setSelectedProvider("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === "select" && (
          <>
            <DialogHeader>
              <DialogTitle>Connect Email Account</DialogTitle>
              <DialogDescription>Only Gmail is supported right now</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <Card
                className="cursor-pointer transition-colors hover:bg-accent"
                onClick={() => {
                  window.location.href = "/api/auth/google/"
                }}
              >
                <CardHeader className="pb">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📧</span>
                    <div>
                      <CardTitle className="text-sm">Gmail</CardTitle>
                      <CardDescription className="text-xs">Connect your Gmail account</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </>
        )}

        {step === "oauth" && (
          <>
            <DialogHeader>
              <DialogTitle>Connecting to Gmail</DialogTitle>
              <DialogDescription>Please wait while we securely connect your account...</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-sm text-muted-foreground">Authenticating...</p>
            </div>
          </>
        )}

        {step === "success" && (
          <>
            <DialogHeader>
              <DialogTitle>Successfully Connected!</DialogTitle>
              <DialogDescription>Your Gmail account has been connected and is ready to use.</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">We're now syncing your emails...</p>
              <Button onClick={handleClose} className="w-full">
                Continue to Dashboard
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
