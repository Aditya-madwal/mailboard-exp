import axios from 'axios'
import toast from "react-hot-toast"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

/**
 * Get all inbox emails for a specific account
 */
export async function getAllInboxEmails(accountId) {
    try {
        const response = await axios.get(`${BASE_URL}/api/mail/${accountId}/inbox/all/`)
        return response.data
    } catch (err) {
        console.error("Failed to fetch all inbox emails:", err)
        return null
    }
}

// get inbox from google for a specific account
export async function getInboxEmails(accountId) {
    try {
        const response = await axios.get(`${BASE_URL}/api/mail/${accountId}/inbox/`)
        return response.data.inbox
    } catch (err) {
        console.error("Failed to fetch all inbox emails:", err)
        return null
    }
}

/**
 * Get all emails across all accounts
 */
export async function getAllEmails() {
    try {
        const response = await axios.get(`${BASE_URL}/api/mail/inbox/all/`)
        return response.data
    } catch (err) {
        console.error("Failed to fetch all emails:", err)
        return null
    }
}

/**
 * Get a specific email by ID
 */
export async function getSpecificEmail(accountId, emailId) {
    try {
        const response = await axios.get(`${BASE_URL}/api/mail/${accountId}/inbox/${emailId}/`)
        return response.data
    } catch (err) {
        console.error("Failed to fetch specific email:", err)
        return null
    }
}

/**
 * Mark an email as read
 */
export async function markEmailAsRead(accountId, emailId) {
    try {
        const response = await axios.patch(`${BASE_URL}/api/mail/${accountId}/inbox/${emailId}/read/`)
        return response.data
    } catch (err) {
        console.error("Failed to mark email as read:", err)
        return null
    }
}

/**
 * Send an email
 */
export async function sendEmail(accountId, emailData) {
    try {
        const formData = new FormData()

        formData.append('to', emailData.to)
        formData.append('subject', emailData.subject)
        formData.append('message', emailData.message)

        if (emailData.cc) {
            formData.append('cc', emailData.cc)
        }
        if (emailData.bcc) {
            formData.append('bcc', emailData.bcc)
        }

        if (emailData.attachments && emailData.attachments.length > 0) {
            emailData.attachments.forEach((file) => {
                formData.append('attachments', file)
            })
        }

        const response = await axios.post(`${BASE_URL}/api/mail/${accountId}/send/`, formData)
        return response.data
    } catch (err) {
        toast.error(`Failed to send email: `)
        console.error("Failed to send email:", err)
        return null
    }
}

/**
 * Download email attachment
 */
export async function downloadAttachment(accountId, emailId, attachmentId) {
    try {
        const response = await axios.get(
            `${BASE_URL}/api/mail/${accountId}/inbox/${emailId}/attachment/${attachmentId}`,
            { responseType: 'blob' }
        )
        return response.data
    } catch (err) {
        console.error("Failed to download attachment:", err)
        return null
    }
}

/**
 * Generate email body using AI
 */
export async function generateEmailBody(subject) {
    try {
        const response = await axios.post(`${BASE_URL}/api/mail/generate/`, { subject })
        return response.data.data
    } catch (err) {
        console.error("Failed to generate email body:", err)
        toast.error("Failed to generate email content. Please try again.")
        return null
    }
}

/**
 * change email category
 */
export async function changeEmailCategory(accountId, emailId, category) {
    try {
        const response = await axios.patch(`${BASE_URL}/api/mail/${accountId}/inbox/${emailId}/category/`, { new_category: category })
        return response.data
    } catch (err) {
        console.error("Failed to change email category:", err)
        toast.error("Failed to change email category. Please try again.")
        return null
    }
}