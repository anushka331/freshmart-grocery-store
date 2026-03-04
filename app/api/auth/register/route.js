/**
 * app/api/auth/register/route.js
 * POST /api/auth/register - Register a new user
 */

import { NextResponse } from 'next/server'
import dbConnect from '@/app/lib/db'
import User from '@/app/models/User'
import { generateToken } from '@/app/lib/auth'

export async function POST(request) {
  try {
    await dbConnect()

    const body = await request.json()
    const { name, email, password, phone } = body

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Create new user (password hashed via pre-save hook in model)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || undefined,
      // First user becomes admin (for demo purposes)
      role: (await User.countDocuments()) === 0 ? 'admin' : 'user',
    })

    // Generate JWT token
    const token = generateToken(user)

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: userResponse,
        token,
      },
      { status: 201 }
    )

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Register error:', error)

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message)
      return NextResponse.json(
        { success: false, message: messages.join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}
