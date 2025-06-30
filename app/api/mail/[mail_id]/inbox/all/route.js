// app/api/mail/[mail_id]/inbox/all/route.js

import dbConnect from '@/lib/db'
import { validateAuth } from '@/lib/auth'
import GmailAccount from '@/models/GmailAccount'
import InboxMail from '@/models/InboxMail'
import { NextResponse } from 'next/server'

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

        const gmailAccount = await GmailAccount.findById(mail_id)
        if (!gmailAccount || gmailAccount.user.toString() !== authResult.user.userId) {
            return NextResponse.json({ error: 'Unauthorized or Gmail account not found' }, { status: 403 })
        }

        // Fetch all saved emails for this Gmail account, sorted by date descending
        const inboxMails = await InboxMail.find({ gmailAccount: mail_id }).sort({ date: -1 })
        console.log(`total_emails = ${inboxMails.length}`)

        return NextResponse.json(inboxMails)
    } catch (err) {
        console.error('Local inbox fetch error:', err)
        return NextResponse.json({ error: 'Failed to fetch saved inbox mails' }, { status: 500 })
    }
}
