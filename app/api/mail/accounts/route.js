import dbConnect from '@/lib/db'
import { validateAuth } from '@/lib/auth'
import GmailAccount from '@/models/GmailAccount'
import { NextResponse } from 'next/server'

export async function GET(request) {
    try {
        await dbConnect()

        const authResult = await validateAuth(request)
        if (!authResult.isValid) {
            return NextResponse.json({ data: null, error: authResult.error }, { status: 401 })
        }

        const userId = authResult.user.userId

        // Fetch all Gmail accounts linked to this user
        const gmailAccounts = await GmailAccount.find({ user: userId }).select('-accessToken -refreshToken') // Exclude tokens

        return NextResponse.json({
            data: gmailAccounts,
            error: null
        })

    } catch (error) {
        console.error('Error fetching Gmail accounts:', error)
        return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
    }
}
