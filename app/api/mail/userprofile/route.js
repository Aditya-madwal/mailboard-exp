import dbConnect from '@/lib/db'
import GmailAccount from '@/models/GmailAccount'
import { getGoogleUserProfile } from '@/services/mail/getGoogleUserProfile'
import { NextResponse } from 'next/server'


export async function GET(req) {
    try {
        await dbConnect()

        const account = await GmailAccount.findOne({ email: 'adityamadwal@gmail.com' })

        if (!account) {
            return NextResponse.json({ message: 'Gmail account not found' }, { status: 404 })
        }

        const profile = await getGoogleUserProfile({
            accessToken: account.accessToken,
            refreshToken: account.refreshToken
        })

        return NextResponse.json({ profile })
    } catch (err) {
        console.error('User profile fetch error:', err)
        return NextResponse.json({ message: err.message || 'Internal server error' }, { status: 500 })
    }
}
