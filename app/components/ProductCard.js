'use client'
/**
 * app/components/ProductCard.js
 * Reusable product card component
 */

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'

const categoryEmoji = {
  Fruits: '🍎',
  Vegetables: '🥦',
  Dairy: '🥛',
  Snacks: '🍪',
  Beverages: '🥤',
  Bakery: '🍞',
  Meat: '🥩',
  Frozen: '🧊',
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [message, setMessage] = useState('')

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (!user) {
      router.push('/login')
      return
    }

    setAdding(true)
    const result = await addToCart(product._id, 1)
    setAdding(false)

    if (result.success) {
      setAdded(true)
      setMessage('Added!')
      setTimeout(() => { setAdded(false); setMessage('') }, 2000)
    } else {
      setMessage(result.message || 'Failed')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="product-card bg-white rounded-2xl overflow-hidden shadow-sm border border-green-100 hover:shadow-md group">
      {/* Image */}
      <Link href={`/products/${product._id}`}>
        <div className="relative h-48 overflow-hidden bg-green-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' }}
          />
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discountPercent}%
            </span>
          )}
          {product.stock < 10 && product.stock > 0 && (
            <span className="absolute top-2 right-2 bg-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full">
              Only {product.stock} left
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 font-semibold px-3 py-1 rounded-full text-sm">Out of Stock</span>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-medium text-green-700">
            {categoryEmoji[product.category]} {product.category}
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link href={`/products/${product._id}`}>
          <h3 className="font-semibold text-gray-800 text-base leading-tight hover:text-green-700 transition-colors line-clamp-1 mb-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-xs line-clamp-2 mb-3 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-green-700">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
            )}
            <span className="text-xs text-gray-400">/ {product.unit}</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all btn-press ${
              added
                ? 'bg-green-500 text-white'
                : product.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-500 text-white'
            }`}
          >
            {adding ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : added ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {message}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </>
            )}
          </button>
        </div>

        {message && !added && (
          <p className="text-red-500 text-xs mt-1">{message}</p>
        )}
      </div>
    </div>
  )
}
