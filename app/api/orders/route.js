/**
 * app/api/orders/route.js
 * POST /api/orders - Place a new order
 * GET /api/orders - Get user's order history
 */

import { NextResponse } from 'next/server'
import dbConnect from '@/app/lib/db'
import User from '@/app/models/User'
import Product from '@/app/models/Product'
import Order from '@/app/models/Order'
import { authenticate } from '@/app/lib/auth'

export async function GET(request) {
  try {
    const { user: tokenUser, error } = authenticate(request)
    if (error || !tokenUser) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })
    }
    await dbConnect()
    const orders = await Order.find({ userId: tokenUser.userId }).sort({ orderDate: -1 }).lean()
    return NextResponse.json({ success: true, orders })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { user: tokenUser, error } = authenticate(request)
    if (error || !tokenUser) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })
    }
    await dbConnect()
    const { address, paymentMethod = 'cash_on_delivery', notes } = await request.json()
    if (!address || !address.fullName || !address.street || !address.city || !address.state || !address.zipCode) {
      return NextResponse.json({ success: false, message: 'Complete delivery address is required' }, { status: 400 })
    }
    const user = await User.findById(tokenUser.userId).populate('cart.productId')
    if (!user || user.cart.length === 0) {
      return NextResponse.json({ success: false, message: 'Your cart is empty' }, { status: 400 })
    }
    const orderProducts = []
    let subtotal = 0
    for (const item of user.cart) {
      const product = item.productId
      if (!product || !product.isAvailable) {
        return NextResponse.json({ success: false, message: `Product ${product?.name || 'unknown'} is no longer available` }, { status: 400 })
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ success: false, message: `Insufficient stock for ${product.name}` }, { status: 400 })
      }
      orderProducts.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
        category: product.category,
      })
      subtotal += product.price * item.quantity
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } })
    }
    const deliveryFee = subtotal > 50 ? 0 : 4.99
    const totalPrice = Math.round((subtotal + deliveryFee) * 100) / 100
    const order = await Order.create({
      userId: tokenUser.userId,
      products: orderProducts,
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee,
      totalPrice,
      address,
      paymentMethod,
      notes: notes || '',
      orderDate: new Date(),
    })
    user.cart = []
    await user.save()
    return NextResponse.json({ success: true, message: 'Order placed successfully!', order }, { status: 201 })
  } catch (error) {
    console.error('Place order error:', error)
    return NextResponse.json({ success: false, message: 'Failed to place order' }, { status: 500 })
  }
}
