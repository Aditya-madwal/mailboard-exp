import dbConnect from '@/lib/db'
import { validateAuth } from '@/lib/auth'
import InboxMail from '@/models/InboxMail'
import { NextResponse } from 'next/server'
import { UserCategory } from '@/models/UserCategory'

export async function GET(request) {
    try {
        await dbConnect()

        const authResult = await validateAuth(request)
        if (!authResult.isValid) {
            return NextResponse.json({ error: authResult.error }, { status: 401 })
        }

        const userId = authResult.user.userId

        const mails = await InboxMail.find({ user: userId })
            .sort({ date: -1 })
            .lean()

        return NextResponse.json(mails, { status: 200 })
    } catch (error) {
        console.error('Unified inbox fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch inbox' }, { status: 500 })
    }
}
