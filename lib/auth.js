import { verifyToken } from './jwt'
import { NextResponse } from 'next/server'

export function getTokenFromCookies(request) {
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) return null

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = value
        return acc
    }, {})

    return cookies.token || null
}

export function createAuthResponse(message, status = 401) {
    return NextResponse.json({ message }, { status })
}

export async function validateAuth(request) {
    const token = getTokenFromCookies(request)

    if (!token) {
        return { isValid: false, error: 'No authentication token provided' }
    }

    const decoded = verifyToken(token)
    if (!decoded) {
        return { isValid: false, error: 'Invalid or expired token' }
    }

    return { isValid: true, user: decoded }
}