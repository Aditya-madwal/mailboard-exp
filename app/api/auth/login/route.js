import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '../../../../lib/db'
import User from '../../../../models/User'
import { generateToken } from '../../../../lib/jwt'
import { validateEmail, checkRateLimit } from '../../../../lib/validation'

export async function POST(request) {
  try {
    await dbConnect()

    const body = await request.json()
    const { email, password } = body

    // Validate input
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' }, // Don't reveal specific validation errors for security
        { status: 401 }
      )
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate token
    const token = generateToken({
      userId: user._id,
      email: user.email
    })

    // Create response with httpOnly cookie
    const response = NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })

    // Set httpOnly cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// import { NextResponse } from "next/server";
// import { sign } from "jsonwebtoken";
// import { serialize } from "cookie";

// const MAX_AGE = 60 * 60 * 24;

// export async function POST(request) {
//   const body = await request.json();
//   const { username, password } = body;

//   if (username != "admin" || password != "admin") {
//     return NextResponse.json(
//       { message: 'Invalid credentials' },
//       { status: 401 }
//     )
//   }

//   const secret = process.env.JWT_SECRET || "";

//   const token = sign(
//     { username },
//     secret, {
//     expiresIn: MAX_AGE,
//   });

//   const serialized = serialize(
//     "OursiteJWT",
//     token,
//     {
//       maxAge: MAX_AGE,
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       path: "/"
//     });

//   const response = new Response(
//     JSON.stringify({ message: "Login successful" }),
//     {
//       status: 200,
//       headers: { "Set-Cookie": serialized }
//     },
//   )

//   return response;

// }