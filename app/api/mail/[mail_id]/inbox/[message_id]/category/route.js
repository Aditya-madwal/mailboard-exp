// app/api/mail/[mail_id]/inbox/[message_id]/read/route.js

import { google } from 'googleapis'
import dbConnect from '@/lib/db'
import GmailAccount from '@/models/GmailAccount'
import { validateAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import InboxMail from '@/models/InboxMail'
import UserCategory from '@/models/UserCategory'

export async function PATCH(request, { params }) {
    try {
        const { mail_id, message_id } = await params

        const { new_category } = await request.json()

        // Validate params
        if (!mail_id || !message_id) {
            return NextResponse.json({ error: 'Mail ID and Message ID are required' }, { status: 400 })
        }

        // Validate body (new category)
        if (!new_category || new_category.trim() === '') {
            return NextResponse.json({ error: 'New category is required' }, { status: 400 })
        }

        await dbConnect()

        // Authenticate user
        const authResult = await validateAuth(request)
        if (!authResult.isValid) {
            return NextResponse.json({ error: authResult.error }, { status: 401 })
        }

        // Find Gmail account and verify ownership
        const gmailAccount = await GmailAccount.findById(mail_id)
        if (!gmailAccount || gmailAccount.user.toString() !== authResult.user.userId) {
            return NextResponse.json({ error: 'Unauthorized or Gmail account not found' }, { status: 403 })
        }

        const newCategory = await UserCategory.findOne({ _id: new_category, user: authResult.user.userId })

        const updated_mail = await InboxMail.findOneAndUpdate(
            { messageId: message_id, user: authResult.user.userId },
            { UserCategory: newCategory ? newCategory._id : null, isCategorized: !!newCategory },
            { new: true }
        )

        return NextResponse.json({ message: 'Message category updated', updated_mail }, { status: 200 })
    } catch (err) {
        console.error('Update category error:', err)
        return NextResponse.json({ error: 'Failed to update message category' }, { status: 500 })
    }
}
