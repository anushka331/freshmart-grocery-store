/**
 * models/Product.js
 * Mongoose schema for grocery products
 */

import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number, // For showing discounts
      min: [0, 'Original price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Fruits', 'Vegetables', 'Dairy', 'Snacks', 'Beverages', 'Bakery', 'Meat', 'Frozen'],
        message: '{VALUE} is not a valid category',
      },
    },
    image: {
      type: String,
      required: [true, 'Product image URL is required'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    unit: {
      type: String,
      default: 'kg',
      enum: ['kg', 'g', 'litre', 'ml', 'piece', 'dozen', 'pack', 'lb'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    tags: [String], // e.g., ['organic', 'fresh', 'imported']
  },
  {
    timestamps: true,
  }
)

// Virtual for discount percentage
ProductSchema.virtual('discountPercent').get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100)
  }
  return 0
})

// Index for search performance
ProductSchema.index({ name: 'text', description: 'text', category: 1 })

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)

export default Product
