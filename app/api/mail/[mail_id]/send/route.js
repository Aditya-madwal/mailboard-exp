// app/api/mail/[mail_id]/send/route.js

import dbConnect from '@/lib/db'
import { validateAuth } from '@/lib/auth'
import { getValidOAuthClient } from '@/services/mail/getValidOAuthClient'
import { google } from 'googleapis'
import { NextResponse } from 'next/server'

export async function POST(request, { params }) {
    try {
        const { mail_id } = await params
        await dbConnect()

        const authResult = await validateAuth(request)
        if (!authResult.isValid) {
            return NextResponse.json({ error: authResult.error }, { status: 401 })
        }

        const { oauth2Client, gmailAccount } = await getValidOAuthClient(mail_id)

        if (!gmailAccount || gmailAccount.user.toString() !== authResult.user.userId) {
            return NextResponse.json({ error: 'Unauthorized or Gmail account not found' }, { status: 403 })
        }

        const formData = await request.formData()
        const normalizeEmails = (str) =>
            str
                .split(',')
                .map((email) => email.trim())
                .filter((email) => !!email)
                .join(',') // ensures clean formatting for Gmail headers

        const to = normalizeEmails(formData.get('to') || '')
        const cc = normalizeEmails(formData.get('cc') || '')
        const bcc = normalizeEmails(formData.get('bcc') || '')
        const subject = formData.get('subject') || '(no subject)'
        const message = formData.get('message') || ''
        const attachments = formData.getAll('attachments') || []

        const boundary = '__MY_BOUNDARY__'
        let rawMessage = ''

        rawMessage += `To: ${to}\r\n`
        if (cc) rawMessage += `Cc: ${cc}\r\n`
        if (bcc) rawMessage += `Bcc: ${bcc}\r\n`
        rawMessage += `Subject: ${subject}\r\n`
        rawMessage += `MIME-Version: 1.0\r\n`
        rawMessage += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`

        // Plain text
        rawMessage += `--${boundary}\r\n`
        rawMessage += `Content-Type: text/plain; charset="UTF-8"\r\n`
        rawMessage += `Content-Transfer-Encoding: 7bit\r\n\r\n`
        rawMessage += `${message}\r\n\r\n`

        // Attachments
        for (const file of attachments) {
            const buffer = Buffer.from(await file.arrayBuffer())
            const base64 = buffer.toString('base64')
            const filename = file.name

            rawMessage += `--${boundary}\r\n`
            rawMessage += `Content-Type: ${file.type}; name="${filename}"\r\n`
            rawMessage += `Content-Disposition: attachment; filename="${filename}"\r\n`
            rawMessage += `Content-Transfer-Encoding: base64\r\n\r\n`
            rawMessage += `${base64}\r\n\r\n`
        }

        rawMessage += `--${boundary}--`

        const encodedMessage = Buffer.from(rawMessage)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '')

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

        await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw: encodedMessage }
        })

        return NextResponse.json({ message: 'Mail sent successfully' })
    } catch (err) {
        console.error('Mail send error:', err)
        return NextResponse.json({ error: 'Failed to send mail' }, { status: 500 })
    }
}
