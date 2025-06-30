import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db'
import User from '../../../../models/User'
import { validateAuth } from '../../../../lib/auth'

export async function GET(request) {
  try {
    await dbConnect()

    // Validate authentication
    const authResult = await validateAuth(request)
    if (!authResult.isValid) {
      return NextResponse.json({
        user: null,
        error: { message: authResult.error }
      }, { status: 401 })
    }

    // Find user
    const user = await User.findById(authResult.user.userId).select('-password')
    if (!user) {
      return NextResponse.json({
        user: null,
        error: { message: 'User not found' }
      }, { status: 404 })
    }

    return NextResponse.json({
      user:
        user
      ,
      error: null
    })

  } catch (error) {
    console.error('ShowMe error:', error)
    return NextResponse.json({
      user: null,
      error: { message: 'Internal server error' }
    }, { status: 500 })
  }
}
