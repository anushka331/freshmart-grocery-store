/**
 * models/Order.js
 * Mongoose schema for customer orders
 */

import mongoose from 'mongoose'

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: {
          type: String,
          required: true, // Snapshot of product name at time of order
        },
        price: {
          type: Number,
          required: true, // Snapshot of price at time of order
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        image: String, // Snapshot of image
        category: String,
      },
    ],
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    address: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: 'US' },
      phone: String,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'cash_on_delivery', 'upi', 'wallet'],
      default: 'cash_on_delivery',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    estimatedDelivery: {
      type: Date,
    },
    notes: String, // Special delivery instructions
    trackingNumber: String,
  },
  {
    timestamps: true,
  }
)

// Pre-save: calculate estimated delivery (3 days from now)
OrderSchema.pre('save', function (next) {
  if (!this.estimatedDelivery) {
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + 3)
    this.estimatedDelivery = deliveryDate
  }
  next()
})

// Index for query performance
OrderSchema.index({ userId: 1, orderDate: -1 })
OrderSchema.index({ orderStatus: 1 })

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema)

export default Order
