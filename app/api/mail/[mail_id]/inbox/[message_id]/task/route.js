// app/api/mail/[mail_id]/inbox/[message_id]/task/route.js

import { NextResponse } from 'next/server'
import InboxMail from '@/models/InboxMail'
import Task from '@/models/Task'
import dbConnect from '@/lib/db'
import { validateAuth } from '@/lib/auth'
import { convertEmailToTask } from '@/services/ai/emailToTask' // <- ✅ you must export it from your Gemini script

export async function POST(request, { params }) {
    await dbConnect()

    const { mail_id, message_id } = await params

    const authResult = await validateAuth(request)
    if (!authResult.isValid) {
        return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const userId = authResult.user.userId

    try {
        const mail = await InboxMail.findOne({
            messageId: message_id,
            user: userId,
        }).lean()

        if (!mail) {
            return NextResponse.json({ error: 'Mail not found' }, { status: 404 })
        }

        const taskPayload = await convertEmailToTask(mail)

        const newTask = new Task({
            ...taskPayload,
            createdBy: userId,
        })

        await newTask.save()

        return NextResponse.json({ success: true, task: newTask }, { status: 201 })

    } catch (error) {
        console.error('Email to Task Error:', error)
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }
}
