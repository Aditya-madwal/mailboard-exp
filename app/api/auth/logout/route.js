import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request) {
    try {
        const response = NextResponse.json({
            message: 'Logged out successfully'
        })

        // Clear the httpOnly cookie
        response.cookies.set('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0, // Expire immediately
            path: '/'
        })

        return response

    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
