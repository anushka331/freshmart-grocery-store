/**
 * app/api/cart/route.js
 * Cart API Routes
 */

import { NextResponse } from 'next/server'
import dbConnect from '@/app/lib/db'
import User from '@/app/models/User'
import Product from '@/app/models/Product'
import { authenticate } from '@/app/lib/auth'

export async function GET(request) {
  try {
    const { user: tokenUser, error } = authenticate(request)
    if (error || !tokenUser) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })
    }
    await dbConnect()
    const user = await User.findById(tokenUser.userId)
      .populate('cart.productId', 'name price image category stock unit isAvailable description')
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    const validCart = user.cart.filter(item => item.productId !== null)
    const subtotal = validCart.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0)
    const deliveryFee = subtotal > 50 ? 0 : 4.99
    return NextResponse.json({
      success: true,
      cart: validCart,
      summary: {
        itemCount: validCart.length,
        totalQuantity: validCart.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: Math.round(subtotal * 100) / 100,
        deliveryFee,
        total: Math.round((subtotal + deliveryFee) * 100) / 100,
      },
    })
  } catch (error) {
    console.error('Get cart error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { user: tokenUser, error } = authenticate(request)
    if (error || !tokenUser) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })
    }
    await dbConnect()
    const { productId, quantity = 1 } = await request.json()
    if (!productId) return NextResponse.json({ success: false, message: 'Product ID required' }, { status: 400 })
    const product = await Product.findById(productId)
    if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
    if (product.stock < quantity) {
      return NextResponse.json({ success: false, message: `Only ${product.stock} items in stock` }, { status: 400 })
    }
    const user = await User.findById(tokenUser.userId)
    const existingItemIndex = user.cart.findIndex(item => item.productId.toString() === productId)
    if (existingItemIndex >= 0) {
      const newQty = user.cart[existingItemIndex].quantity + quantity
      if (newQty > product.stock) {
        return NextResponse.json({ success: false, message: `Cannot add more. Only ${product.stock} in stock.` }, { status: 400 })
      }
      user.cart[existingItemIndex].quantity = newQty
    } else {
      user.cart.push({ productId, quantity })
    }
    await user.save()
    return NextResponse.json({ success: true, message: `${product.name} added to cart`, cartCount: user.cart.length })
  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json({ success: false, message: 'Failed to add to cart' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { user: tokenUser, error } = authenticate(request)
    if (error || !tokenUser) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })
    }
    await dbConnect()
    const { productId, quantity } = await request.json()
    if (!productId || quantity === undefined) {
      return NextResponse.json({ success: false, message: 'Product ID and quantity required' }, { status: 400 })
    }
    const user = await User.findById(tokenUser.userId)
    const itemIndex = user.cart.findIndex(item => item.productId.toString() === productId)
    if (itemIndex === -1) return NextResponse.json({ success: false, message: 'Item not in cart' }, { status: 404 })
    if (quantity === 0) {
      user.cart.splice(itemIndex, 1)
    } else {
      user.cart[itemIndex].quantity = quantity
    }
    await user.save()
    return NextResponse.json({ success: true, message: quantity === 0 ? 'Item removed' : 'Cart updated', cartCount: user.cart.length })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update cart' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { user: tokenUser, error } = authenticate(request)
    if (error || !tokenUser) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })
    }
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const clearAll = searchParams.get('clearAll')
    const user = await User.findById(tokenUser.userId)
    if (clearAll === 'true') {
      user.cart = []
    } else {
      if (!productId) return NextResponse.json({ success: false, message: 'Product ID required' }, { status: 400 })
      user.cart = user.cart.filter(item => item.productId.toString() !== productId)
    }
    await user.save()
    return NextResponse.json({ success: true, message: clearAll ? 'Cart cleared' : 'Item removed', cartCount: user.cart.length })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to remove item' }, { status: 500 })
  }
}
