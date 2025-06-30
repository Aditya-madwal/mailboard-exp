import { google } from 'googleapis'
import dbConnect from '@/lib/db'
import { validateAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { getValidOAuthClient } from '@/services/mail/getValidOAuthClient'

// Convert Buffer to ReadableStream for binary download support
function bufferToReadableStream(buffer) {
    return new ReadableStream({
        start(controller) {
            controller.enqueue(buffer)
            controller.close()
        },
    })
}

export async function GET(request, { params }) {
    try {
        const { mail_id, message_id, attachment_id } = await params

        if (!mail_id || !message_id || !attachment_id) {
            return NextResponse.json({ error: 'Missing params' }, { status: 400 })
        }

        await dbConnect()

        const authResult = await validateAuth(request)
        if (!authResult.isValid) {
            return NextResponse.json({ error: authResult.error }, { status: 401 })
        }

        const { oauth2Client, gmailAccount } = await getValidOAuthClient(mail_id)
        if (!gmailAccount || gmailAccount.user.toString() !== authResult.user.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

        // Fetch attachment content
        const attachmentRes = await gmail.users.messages.attachments.get({
            userId: 'me',
            messageId: message_id,
            id: attachment_id,
        })

        const fileData = attachmentRes.data.data
        const fileBuffer = Buffer.from(fileData, 'base64')

        // Fetch metadata for filename and MIME type
        const msgDetail = await gmail.users.messages.get({
            userId: 'me',
            id: message_id,
            format: 'full',
        })

        const part = msgDetail.data.payload.parts.find(p => p.body.attachmentId === attachment_id)
        const filename = part?.filename || 'attachment'
        const mimeType = part?.mimeType || 'application/octet-stream'

        // Return the buffer as a proper download stream
        return new NextResponse(bufferToReadableStream(fileBuffer), {
            status: 200,
            headers: {
                'Content-Type': mimeType,
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        })
    } catch (err) {
        console.error('Attachment download error:', err)
        return NextResponse.json({ error: 'Failed to download attachment' }, { status: 500 })
    }
}
