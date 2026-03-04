/**
 * app/api/auth/me/route.js
 * GET /api/auth/me - Get current authenticated user
 */

import { NextResponse } from 'next/server'
import dbConnect from '@/app/lib/db'
import User from '@/app/models/User'
import { authenticate } from '@/app/lib/auth'

export async function GET(request) {
  try {
    const { user: tokenUser, error } = authenticate(request)

    if (error || !tokenUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    await dbConnect()

    const user = await User.findById(tokenUser.userId).populate('cart.productId', 'name price image stock')

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        cart: user.cart,
      },
    })
  } catch (error) {
    console.error('Get me error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
