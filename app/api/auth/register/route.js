import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '../../../../lib/db'
import User from '../../../../models/User'
import { validateEmail, validatePassword, validateName, checkRateLimit } from '../../../../lib/validation'

export async function POST(request) {
  try {
    await dbConnect()

    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Check rate limit
    const rateLimit = checkRateLimit(`register:${ip}`, 3, 15 * 60 * 1000) // 3 attempts per 15 minutes
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { name, email, password } = body

    // Validate input
    const nameValidation = validateName(name)
    if (!nameValidation.isValid) {
      return NextResponse.json(
        { message: nameValidation.message },
        { status: 400 }
      )
    }

    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { message: emailValidation.message },
        { status: 400 }
      )
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { message: passwordValidation.message },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12) // Increased rounds for better security

    // Create user with sanitized data
    const user = await User.create({
      name: nameValidation.sanitized,
      email: email.toLowerCase().trim(),
      password: hashedPassword
    })

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
