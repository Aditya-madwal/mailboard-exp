// app/api/mail/[mail_id]/inbox/[message_id]/route.js

import { google } from 'googleapis'
import dbConnect from '@/lib/db'
import GmailAccount from '@/models/GmailAccount'
import InboxMail from '@/models/InboxMail'
import { validateAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { getValidOAuthClient } from '@/services/mail/getValidOAuthClient'

export async function GET(request, { params }) {
    try {
        const { mail_id, message_id } = await params

        if (!mail_id || !message_id) {
            return NextResponse.json({ error: 'Mail ID and Message ID are required' }, { status: 400 })
        }

        await dbConnect()
        const authResult = await validateAuth(request)
        if (!authResult.isValid) {
            return NextResponse.json({ error: authResult.error }, { status: 401 })
        }

        const { oauth2Client, gmailAccount } = await getValidOAuthClient(mail_id)
        if (!gmailAccount || gmailAccount.user.toString() !== authResult.user.userId) {
            return NextResponse.json({ error: 'Gmail account not found or unauthorized' }, { status: 403 })
        }

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
        const people = google.people({ version: 'v1', auth: oauth2Client })

        const detail = await gmail.users.messages.get({
            userId: 'me',
            id: message_id,
            format: 'full',
        })

        const payload = detail.data.payload || {}
        const headers = payload.headers || []

        const getHeader = (name) =>
            headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || ''

        const from = getHeader('From')
        const to = getHeader('To')
        const cc = getHeader('Cc')
        const bcc = getHeader('Bcc')
        const subject = getHeader('Subject')
        const date = getHeader('Date')

        const senderEmail = extractEmail(from)
        const senderName = from.split('<')[0].trim()

        let senderPicture = null
        try {
            const contact = await people.people.searchContacts({
                query: senderEmail,
                readMask: 'photos',
                pageSize: 1,
            })
            if (contact?.data?.results?.[0]?.person?.photos?.[0]?.url) {
                senderPicture = contact.data.results[0].person.photos[0].url
            }
        } catch (err) {
            console.warn('Could not fetch contact photo for:', senderEmail)
        }

        const parts = payload.parts || []
        const attachments = []

        const findAttachments = (partList) => {
            for (const part of partList) {
                if (part.parts) {
                    findAttachments(part.parts)
                } else if (part.filename && part.body?.attachmentId) {
                    attachments.push({
                        filename: part.filename,
                        mimeType: part.mimeType,
                        attachmentId: part.body.attachmentId,
                    })
                }
            }
        }
        findAttachments(parts)

        // Extract body content - handle nested multipart structure
        const extractBodyFromParts = (partList) => {
            for (const part of partList) {
                // If this part has nested parts, recurse
                if (part.parts && part.parts.length > 0) {
                    const nestedBody = extractBodyFromParts(part.parts)
                    if (nestedBody) return nestedBody
                }
                // Check if this part contains body content
                else if (part.body?.data && (part.mimeType === 'text/plain' || part.mimeType === 'text/html')) {
                    return part.body.data
                }
            }
            return null
        }

        let encodedBody = ''

        // Try to extract body from parts first
        if (parts.length > 0) {
            encodedBody = extractBodyFromParts(parts) || ''
        }

        // Fallback to payload body if no parts or no body found in parts
        if (!encodedBody && payload.body?.data) {
            encodedBody = payload.body.data
        }

        const decodedBody = encodedBody ? Buffer.from(encodedBody, 'base64').toString('utf-8') : ''

        const isUnread = detail.data.labelIds?.includes('UNREAD')
        const labelIds = detail.data.labelIds || []

        // Convert CC and BCC to arrays
        const parseEmailList = (str) => str ? str.split(',').map(e => e.trim()) : []
        const ccList = parseEmailList(cc)
        const bccList = parseEmailList(bcc)

        // Save or update the message in InboxMail
        await InboxMail.findOneAndUpdate(
            { messageId: message_id },
            {
                gmailAccount: gmailAccount._id,
                messageId: detail.data.id,
                threadId: detail.data.threadId,
                snippet: detail.data.snippet,
                subject,
                from,
                to,
                cc: ccList,
                bcc: bccList,
                senderName,
                senderEmail,
                senderPicture,
                body: decodedBody,
                attachments,
                isUnread,
                labelIds,
            },
            { upsert: true, new: true }
        )

        return NextResponse.json({
            id: detail.data.id,
            threadId: detail.data.threadId,
            snippet: detail.data.snippet,
            subject,
            from,
            to,
            cc: ccList,
            bcc: bccList,
            date,
            senderName,
            senderEmail,
            senderPicture,
            body: decodedBody,
            attachments,
            isUnread,
            labelIds,
        })
    } catch (err) {
        console.error('Mail detail fetch error:', err)
        return NextResponse.json({ error: 'Failed to fetch mail details' }, { status: 500 })
    }
}

function extractEmail(rawFrom) {
    const match = rawFrom.match(/<(.*)>/)
    return match ? match[1] : rawFrom
}

