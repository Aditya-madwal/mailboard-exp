// app/api/mail/[mail_id]/inbox/route.js

import { google } from 'googleapis'
import dbConnect from '@/lib/db'
import GmailAccount from '@/models/GmailAccount'
import { validateAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { getValidOAuthClient } from '@/services/mail/getValidOAuthClient'
import InboxMail from '@/models/InboxMail'
// import categorizeEmails from '@services/ai/emailCategorizer'
import { categorizeEmails } from '@/services/ai/emailCategorizer'
import UserCategory from '@/models/UserCategory'


export async function GET(request, { params }) {
    try {
        const { mail_id } = await params

        if (!mail_id) {
            return NextResponse.json({ error: 'Mail ID is required' }, { status: 400 })
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

        // return NextResponse.json(gmailAccount)

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
        const people = google.people({ version: 'v1', auth: oauth2Client })

        const allMailsRes = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 50,
        })

        const messageIds = allMailsRes.data.messages || []

        // Step 1: Fetch and save all emails to database first
        const detailedMessages = await Promise.all(
            messageIds.map(async (msg) => {
                const detail = await gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id,
                    format: 'full',
                })

                const payload = detail.data.payload || {}
                const headers = payload.headers || []
                const getHeader = (name) => headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || ''

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
                    // Silently handle contact photo fetch errors
                }

                // Extract attachments
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

                // Extract body content
                const extractBodyFromParts = (partList) => {
                    for (const part of partList) {
                        if (part.parts && part.parts.length > 0) {
                            const nestedBody = extractBodyFromParts(part.parts)
                            if (nestedBody) return nestedBody
                        }
                        else if (part.body?.data && (part.mimeType === 'text/plain' || part.mimeType === 'text/html')) {
                            return part.body.data
                        }
                    }
                    return null
                }

                let encodedBody = ''
                if (parts.length > 0) {
                    encodedBody = extractBodyFromParts(parts) || ''
                }
                if (!encodedBody && payload.body?.data) {
                    encodedBody = payload.body.data
                }

                const decodedBody = encodedBody ? Buffer.from(encodedBody, 'base64').toString('utf-8') : ''
                const isUnread = detail.data.labelIds?.includes('UNREAD')
                const dateStr = date || ''
                const parsedDate = new Date(dateStr)

                // Categorize Gmail category
                const labelIds = detail.data.labelIds || []
                let gmailCategory = 'primary'

                if (labelIds.includes('CATEGORY_PROMOTIONS')) {
                    gmailCategory = 'promotions'
                } else if (labelIds.includes('CATEGORY_SOCIAL')) {
                    gmailCategory = 'social'
                } else if (labelIds.includes('CATEGORY_UPDATES')) {
                    gmailCategory = 'updates'
                } else if (labelIds.includes('CATEGORY_FORUMS')) {
                    gmailCategory = 'forums'
                }

                const parseEmailList = (str) => str ? str.split(',').map(e => e.trim()) : []
                const ccList = parseEmailList(cc)
                const bccList = parseEmailList(bcc)

                // Save to database with UserCategory initially null
                // Only update if iscategorized is false or not set
                const existingMail = await InboxMail.findOne({ messageId: detail.data.id, user: authResult.user.userId })
                let savedMail
                if (!existingMail || existingMail.UserCategory == null) {
                    savedMail = await InboxMail.findOneAndUpdate(
                        { messageId: detail.data.id, user: authResult.user.userId },
                        {
                            gmailAccount: gmailAccount._id,
                            messageId: detail.data.id,
                            threadId: detail.data.threadId,
                            snippet: detail.data.snippet,
                            subject: subject || '',
                            from,
                            to,
                            cc: ccList,
                            bcc: bccList,
                            date: parsedDate,
                            senderName,
                            senderEmail,
                            senderPicture,
                            body: decodedBody,
                            attachments,
                            isUnread,
                            labelIds,
                            gmailCategory,
                            // UserCategory: null, // Will be updated by AI
                            user: authResult.user.userId
                        },
                        { upsert: true, new: true }
                    )
                } else {
                    savedMail = existingMail
                }

                return {
                    id: detail.data.id,
                    threadId: detail.data.threadId,
                    snippet: detail.data.snippet,
                    subject: subject || '',
                    from,
                    to,
                    cc: ccList,
                    bcc: bccList,
                    date: date || '',
                    senderName,
                    senderEmail,
                    senderPicture,
                    body: decodedBody,
                    attachments,
                    isUnread,
                    labelIds,
                    gmailCategory,
                    user: authResult.user.userId,
                    _id: savedMail._id // Include database ID for later updates
                }
            })
        )

        // Step 2: Prepare data for AI categorization (without body content)
        // const emailsForAI = detailedMessages
        //     .filter(msg => msg.UserCategory == null)
        //     .map(msg => ({
        //         id: msg.id,
        //         snippet: msg.snippet,
        //         subject: msg.subject,
        //         senderName: msg.senderName,
        //         senderEmail: msg.senderEmail,
        //         gmailCategory: msg.gmailCategory
        //     }))
        // const emailsForAI = detailedMessages
        //     .filter(msg => msg.UserCategory == null)
        //     .map(msg => ({
        //         id: msg.id,
        //         snippet: msg.snippet,
        //         subject: msg.subject,
        //         senderName: msg.senderName,
        //         senderEmail: msg.senderEmail,
        //         gmailCategory: msg.gmailCategory
        //     }))

        const latestmails = await InboxMail.find({ user: authResult.user.userId, gmailAccount: gmailAccount._id }).sort({ date: -1 }).limit(50)
        const latestUncategorizedMails = latestmails.filter(mail => mail.UserCategory == null).map(mail => ({
            id: mail.messageId,
            snippet: mail.snippet,
            subject: mail.subject,
            senderName: mail.senderName,
            senderEmail: mail.senderEmail,
            gmailCategory: mail.gmailCategory
        }))
        console.log('Latest mails:', latestUncategorizedMails.length)

        // Step 3: Run AI categorization
        const userCategoriesObj = await UserCategory.find({ user: authResult.user.userId })
        const userCategories = userCategoriesObj.map(cat => cat.name)


        if (!userCategories || userCategories.length === 0) {
            console.warn('No user categories found, skipping AI categorization')
        } else {
            try {
                console.log('Running AI categorization for', latestUncategorizedMails.length, 'emails...among : ', userCategories)
                const predictedCategories = await categorizeEmails(latestUncategorizedMails, userCategories)

                // Step 4: Update database with predicted categories
                // const updatePromises = latestUncategorizedMails.map(async (msg, index) => {
                //     const predictedCategory = predictedCategories[index] || null

                //     await InboxMail.findOneAndUpdate(
                //         { messageId: msg.id, user: authResult.user.userId },
                //         { UserCategory: userCategoriesObj.find(cat => cat.name.toLowerCase() === predictedCategory.toLowerCase())?.id || null },
                //         { new: true }
                //     )

                //     // Add predicted category to response
                //     msg.UserCategory = userCategoriesObj.find(cat => cat.name.toLowerCase() === predictedCategory.toLowerCase())?.id || null
                //     return msg
                // })
                // In your inbox route, after AI categorization
                const updatePromises = latestUncategorizedMails.map(async (msg, index) => {
                    const predictedCategory = predictedCategories[index] || 'Uncategorized'

                    // Find the category ID, handle uncategorized case
                    let categoryId = null
                    if (predictedCategory !== 'Uncategorized') {
                        categoryId = userCategoriesObj.find(cat =>
                            cat.name.toLowerCase() === predictedCategory.toLowerCase()
                        )?.id || null
                    }

                    await InboxMail.findOneAndUpdate(
                        { messageId: msg.id, user: authResult.user.userId },
                        { UserCategory: categoryId },
                        { new: true }
                    )

                    msg.UserCategory = categoryId
                    return msg
                })

                const updatedMessages = await Promise.all(updatePromises)
                console.log('AI categorization completed successfully')

                return NextResponse.json(updatedMessages)

            } catch (aiError) {
                console.error('AI categorization failed:', aiError)
                // Return messages without AI categories if AI fails
                const messagesWithFallback = latestUncategorizedMails.map(msg => ({
                    ...msg,
                    UserCategory: null
                }))

                return NextResponse.json(messagesWithFallback)
            }
        }
    } catch (err) {
        console.error('All mails fetch error:', err)
        return NextResponse.json({ error: 'Failed to fetch all mails' }, { status: 500 })
    }
}

function extractEmail(fromHeader) {
    if (!fromHeader) return ''
    const match = fromHeader.match(/<(.+?)>/)
    return match ? match[1] : fromHeader.trim()
}