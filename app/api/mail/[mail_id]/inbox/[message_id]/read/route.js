// app/api/mail/[mail_id]/inbox/[message_id]/read/route.js

import { google } from 'googleapis'
import dbConnect from '@/lib/db'
import GmailAccount from '@/models/GmailAccount'
import { validateAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { getValidOAuthClient } from '@/services/mail/getValidOAuthClient'
import InboxMail from '@/models/InboxMail'

export async function PATCH(request, { params }) {
    try {
        const { mail_id, message_id } = await params

        await dbConnect()

        // Authenticate user
        const authResult = await validateAuth(request)
        if (!authResult.isValid) {
            return NextResponse.json({ error: authResult.error }, { status: 401 })
        }

        // Find Gmail account and verify ownership
        // const gmailAccount = await GmailAccount.findById(mail_id)
        const { oauth2Client, gmailAccount } = await getValidOAuthClient(mail_id)
        if (!gmailAccount || gmailAccount.user.toString() !== authResult.user.userId) {
            return NextResponse.json({ error: 'Unauthorized or Gmail account not found' }, { status: 403 })
        }

        // Set up OAuth client
        // const oauth2Client = new google.auth.OAuth2()
        // oauth2Client.setCredentials({ access_token: gmailAccount.accessToken })

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

        // ✅ Remove the UNREAD label to mark the message as read
        await gmail.users.messages.modify({
            userId: 'me',
            id: message_id,
            requestBody: {
                removeLabelIds: ['UNREAD'] // ✅ only this is needed
            }
        })

        await InboxMail.findOneAndUpdate(
            { messageId: message_id },
            { isUnread: false }
        )

        return NextResponse.json({ message: 'Message marked as read' })
    } catch (err) {
        console.error('Mark read error:', err)
        return NextResponse.json({ error: 'Failed to mark message as read' }, { status: 500 })
    }
}
