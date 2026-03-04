'use client'
/**
 * app/products/[id]/page.js
 * Product detail page
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

const categoryEmoji = { Fruits: '🍎', Vegetables: '🥦', Dairy: '🥛', Snacks: '🍪' }

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`)
        const data = await res.json()
        if (data.success) setProduct(data.product)
        else router.push('/products')
      } catch (error) {
        router.push('/products')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (!user) { router.push('/login'); return }
    setAdding(true)
    const result = await addToCart(product._id, quantity)
    setAdding(false)
    if (result.success) {
      setMessage({ text: `${quantity} item(s) added to cart!`, type: 'success' })
    } else {
      setMessage({ text: result.message || 'Failed to add', type: 'error' })
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-96 shimmer rounded-2xl" />
        <div className="space-y-4">
          <div className="h-8 shimmer rounded" />
          <div className="h-4 shimmer rounded w-1/2" />
          <div className="h-24 shimmer rounded" />
          <div className="h-12 shimmer rounded" />
        </div>
      </div>
    </div>
  )

  if (!product) return null

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-green-600">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-green-600">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category}`} className="hover:text-green-600">{product.category}</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white rounded-3xl p-8 shadow-sm border border-green-100">
        {/* Image */}
        <div className="relative">
          <div className="rounded-2xl overflow-hidden bg-green-50 h-80 md:h-96">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' }}
            />
          </div>
          {discountPercent > 0 && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              Save {discountPercent}%
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                {categoryEmoji[product.category]} {product.category}
              </span>
              {product.stock > 0 ? (
                <span className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">
                  {product.stock} in stock
                </span>
              ) : (
                <span className="bg-red-50 text-red-600 text-sm px-3 py-1 rounded-full">Out of stock</span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-4xl font-bold text-green-700">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
              )}
              <span className="text-gray-500 text-sm">per {product.unit}</span>
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map(tag => (
                  <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div>
            {/* Quantity */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-gray-700 font-medium">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-50 text-gray-600 font-bold transition-colors"
                >
                  −
                </button>
                <span className="px-4 py-2 font-semibold text-gray-800 min-w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-2 hover:bg-gray-50 text-gray-600 font-bold transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-gray-500 text-sm">= ${(product.price * quantity).toFixed(2)}</span>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`mb-3 px-4 py-2 rounded-full text-sm font-medium ${
                message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}>
                {message.text}
              </div>
            )}

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className={`w-full py-4 rounded-full font-bold text-lg transition-all ${
                product.stock === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg active:scale-98'
              }`}
            >
              {adding ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Adding...
                </span>
              ) : product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
            </button>

            <Link
              href="/cart"
              className="block w-full mt-3 py-3 rounded-full border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold text-center transition-colors"
            >
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
