/**
 * app/api/products/route.js
 * GET /api/products - Get all products (with optional filtering)
 * POST /api/products - Add a new product (admin only)
 */

import { NextResponse } from 'next/server'
import dbConnect from '../../lib/db'
import Product from '../../models/Product'
import { authenticate, isAdmin } from '../../lib/auth'

// GET - Fetch all products with optional filters
export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const limit = parseInt(searchParams.get('limit')) || 50
    const page = parseInt(searchParams.get('page')) || 1

    // Build query
    const query = { isAvailable: true }

    if (category && category !== 'All') {
      query.category = category
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    const sortObj = { [sort]: order === 'asc' ? 1 : -1 }

    const totalProducts = await Product.countDocuments(query)
    const products = await Product.find(query)
      .sort(sortObj)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean() // Convert to plain JS objects for performance

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        total: totalProducts,
        page,
        limit,
        pages: Math.ceil(totalProducts / limit),
      },
    })
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST - Create a new product (Admin only)
export async function POST(request) {
  try {
    const { user, error } = authenticate(request)

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    await dbConnect()

    const body = await request.json()
    const { name, price, originalPrice, category, image, description, stock, unit, tags } = body

    // Validate required fields
    if (!name || !price || !category || !image || !description) {
      return NextResponse.json(
        { success: false, message: 'Name, price, category, image, and description are required' },
        { status: 400 }
      )
    }

    const product = await Product.create({
      name: name.trim(),
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      category,
      image,
      description: description.trim(),
      stock: parseInt(stock) || 0,
      unit: unit || 'kg',
      tags: tags || [],
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Product added successfully',
        product,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add product error:', error)

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message)
      return NextResponse.json(
        { success: false, message: messages.join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Failed to add product' },
      { status: 500 }
    )
  }
}
