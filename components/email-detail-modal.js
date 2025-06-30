import { useEffect, useState } from "react"
import {
    Star,
    Reply,
    ReplyAll,
    Forward,
    Archive,
    Trash2,
    Download,
    Paperclip,
    Calendar,
    CheckSquare,
    MoreHorizontal,
    Loader2,
    Users,
    ChevronDown,
    ChevronUp,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useMail } from "@/context/mailContext"
import { convertMailToTask } from "@/services/api/todo"

export const EmailDetailModal = ({ email: initialEmail, open, onOpenChange }) => {
    const [email, setEmail] = useState(null)
    const [loading, setLoading] = useState(false)
    const [isStarred, setIsStarred] = useState(false)
    const [error, setError] = useState(null)
    const [showFullRecipients, setShowFullRecipients] = useState(false)
    const [isConvertingToTask, setIsConvertingToTask] = useState(false)
    const { categories, mailAccounts, tasks, setTasks } = useMail()

    useEffect(() => {
        const fetchEmailDetail = async () => {
            if (!initialEmail) {
                setEmail(null)
                return
            }

            // If email doesn't have body and we have the required data to fetch it
            if (!initialEmail?.body && initialEmail?.messageId && initialEmail?.gmailAccount) {
                setLoading(true)
                setEmail(null)
                setError(null)

                try {
                    const response = await fetch(`/api/mail/${initialEmail.gmailAccount}/inbox/${initialEmail.messageId}`)
                    const data = await response.json()

                    if (response.ok) {
                        setEmail(data)
                        setIsStarred(data.isStarred || false)
                    } else {
                        setError(data.error || "Failed to fetch email")
                        // Fallback to initial email if API fails
                        setEmail(initialEmail)
                        setIsStarred(initialEmail?.isStarred || false)
                    }
                } catch (error) {
                    setError(error.message)
                    // Fallback to initial email if API fails
                    setEmail(initialEmail)
                    setIsStarred(initialEmail?.isStarred || false)
                } finally {
                    setLoading(false)
                }
            } else {
                // Use the initial email data if it already has body or required fields are missing
                setEmail(initialEmail)
                setIsStarred(initialEmail?.isStarred || false)
                setError(null)
            }
        }

        if (open && initialEmail) {
            fetchEmailDetail()
        } else if (!open) {
            // Reset state when modal closes
            setEmail(null)
            setLoading(false)
            setIsStarred(false)
            setError(null)
            setShowFullRecipients(false)
            setIsConvertingToTask(false)
        }
    }, [initialEmail?.messageId, initialEmail?.gmailAccount, open])

    const [currentMailAccount, setCurrentMailAccount] = useState(null);

    useEffect(() => {
        if (email && mailAccounts?.length) {
            setCurrentMailAccount(mailAccounts.find(mail => mail.id == email.gmailAccount) || null);
        } else {
            setCurrentMailAccount(null);
        }
    }, [email, mailAccounts]);

    const createTodo = async (email) => {
        // Set loading state for todo conversion
        setIsConvertingToTask(true)

        try {
            console.log("Creating todo from email:", email?.subject)
            const newTask = await convertMailToTask(email?.gmailAccount, email?.messageId)
            console.log(`✅ Email ${email?.messageId} converted to task successfully`)
            setTasks([...tasks, newTask])
        } catch (err) {
            console.error(`❌ Failed to convert email ${email?.messageId} to task:`, err)
        } finally {
            // Clear loading state
            setIsConvertingToTask(false)
        }
    }

    // Don't render anything if modal is not open
    if (!open) return null

    const getCategoryDetails = (categoryId) => categories?.find((cat) => cat._id === categoryId)

    const formatDateTime = (dateString) => {
        if (!dateString) return ""
        return new Date(dateString).toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const handleCreateTodo = () => {
        if (email) {
            createTodo(email)
        }
    }

    const category = email?.UserCategory ? getCategoryDetails(email.UserCategory) : null

    // Helper function to render recipient list
    const renderRecipientList = (recipients, label) => {
        if (!recipients || recipients.length === 0) return null

        const displayRecipients = showFullRecipients ? recipients : recipients.slice(0, 2)
        const hasMore = recipients.length > 2

        return (
            <div className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground font-medium min-w-[30px]">{label}:</span>
                <div className="flex-1">
                    <div className="flex flex-wrap gap-1">
                        {displayRecipients.map((recipient, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">
                                {recipient}
                            </Badge>
                        ))}
                        {hasMore && !showFullRecipients && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5 text-muted-foreground">
                                +{recipients.length - 2} more
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // Check if there are CC or BCC recipients
    const hasCC = email?.cc && email.cc.length > 0
    const hasBCC = email?.bcc && email.bcc.length > 0
    const totalRecipients = (email?.cc?.length || 0) + (email?.bcc?.length || 0)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {loading ? (
                    // Loading state
                    <div className="flex items-center justify-center py-8">
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm text-muted-foreground">Loading email...</span>
                        </div>
                    </div>
                ) : error ? (
                    // Error state
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <span className="text-sm text-red-500">Error: {error}</span>
                            <div className="mt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.location.reload()}
                                >
                                    Retry
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : !email ? (
                    // No email data state
                    <div className="flex items-center justify-center py-8">
                        <span className="text-sm text-muted-foreground">No email selected</span>
                    </div>
                ) : (
                    // Email content
                    <>
                        <DialogHeader className="flex-shrink-0">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={email?.senderPicture || null} />
                                        <AvatarFallback>
                                            {email?.senderName?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-lg font-semibold">{email.subject || "No Subject"}</h2>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>{email.senderName || "Unknown Sender"}</span>
                                            <span>•</span>
                                            <span>{email.senderEmail || ""}</span>
                                            <span>•</span>
                                            <span>{formatDateTime(email.date)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <Button variant="ghost" size="sm" onClick={() => setIsStarred(!isStarred)} className="h-8 w-8 p-0">
                                        <Star className={`h-4 w-4 ${isStarred ? "fill-yellow-400 text-yellow-400" : ""}`} />
                                    </Button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <Archive className="h-4 w-4 mr-2" />
                                                Archive
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Add to Calendar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* CC/BCC Recipients Section */}
                            {(hasCC || hasBCC) && (
                                <div className="mt-3 p-3 bg-muted/20 rounded-lg border">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Recipients ({totalRecipients})
                                            </span>
                                        </div>
                                        {totalRecipients > 2 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowFullRecipients(!showFullRecipients)}
                                                className="h-6 px-2 text-xs"
                                            >
                                                {showFullRecipients ? (
                                                    <>
                                                        <ChevronUp className="h-3 w-3 mr-1" />
                                                        Show Less
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="h-3 w-3 mr-1" />
                                                        Show All
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        {renderRecipientList(email.cc, "CC")}
                                        {renderRecipientList(email.bcc, "BCC")}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4 pt-2">
                                {category && (
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${category.color}`} />
                                        <span className="text-xs text-muted-foreground">{category.name}</span>
                                    </div>
                                )}

                                {email.attachments?.length > 0 && (
                                    <div className="flex items-center gap-1">
                                        <Paperclip className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">{email.attachments.length} attachments</span>
                                    </div>
                                )}

                                {(hasCC || hasBCC) && (
                                    <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                            {totalRecipients} recipients
                                        </span>
                                    </div>
                                )}

                                {currentMailAccount && (
                                    <Badge variant="secondary" className="text-xs">
                                        Inbox: {currentMailAccount.email}
                                    </Badge>
                                )}
                            </div>
                        </DialogHeader>

                        <Separator />

                        <div className="flex-1 overflow-y-auto py-2">
                            <div className="prose prose-sm max-w-none">
                                {email?.body ? (
                                    <div
                                        className="text-sm leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: email.body }}
                                    />
                                ) : (
                                    <div className="text-sm text-muted-foreground italic">
                                        No email content available
                                    </div>
                                )}
                            </div>

                            {email.attachments?.length > 0 && (
                                <div className="mt-6 pt-4 border-t">
                                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                        <Paperclip className="h-4 w-4" />
                                        Attachments ({email.attachments.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {email.attachments.map((att, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center text-xs font-bold uppercase">
                                                        {att.mimeType?.includes("pdf") && "PDF"}
                                                        {att.mimeType?.includes("sheet") && "XLS"}
                                                        {att.mimeType?.includes("zip") && "ZIP"}
                                                        {!att.mimeType?.includes("pdf") && !att.mimeType?.includes("sheet") && !att.mimeType?.includes("zip") && "FILE"}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium">{att.filename || "Unknown file"}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {att.size ? `${(att.size / 1024 / 1024).toFixed(1)} MB` : "Unknown size"}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <a href={`/api/mail/${email.gmailAccount}/inbox/${email.messageId}/attachment/${att.attachmentId}`} target="blank">
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator />

                        <div className="flex-shrink-0 pt-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Reply className="h-4 w-4 mr-2" />
                                        Reply
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <ReplyAll className="h-4 w-4 mr-2" />
                                        Reply All
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Forward className="h-4 w-4 mr-2" />
                                        Forward
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCreateTodo}
                                        disabled={isConvertingToTask}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700"
                                    >
                                        {isConvertingToTask ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <CheckSquare className="h-4 w-4 mr-2" />
                                        )}
                                        {isConvertingToTask ? "Converting..." : "Create Todo"}
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Archive className="h-4 w-4 mr-2" />
                                        Archive
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}