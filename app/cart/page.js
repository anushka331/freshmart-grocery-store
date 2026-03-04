'use client'
/**
 * app/cart/page.js
 * Shopping cart page
 */

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function CartPage() {
  const { cart, summary, cartLoading, updateQuantity, removeFromCart, clearCart } = useCart()
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  if (loading || cartLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 shimmer rounded-2xl" />
        ))}
      </div>
    </div>
  )

  if (!user) return null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
          My Cart
          {cart.length > 0 && <span className="ml-3 text-lg font-normal text-gray-400">({summary.totalQuantity} items)</span>}
        </h1>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-700 font-medium border border-red-200 px-4 py-2 rounded-full hover:bg-red-50 transition-colors"
          >
            Clear Cart
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Discover fresh groceries and add them to your cart.</p>
          <Link href="/products" className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const product = item.productId
              if (!product) return null
              return (
                <div key={item._id} className="bg-white rounded-2xl p-4 border border-green-100 shadow-sm flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-green-50">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link href={`/products/${product._id}`} className="font-semibold text-gray-800 hover:text-green-700 transition-colors">
                          {product.name}
                        </Link>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(product._id)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-all ml-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                        <button
                          onClick={() => updateQuantity(product._id, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-50 text-gray-600 font-bold text-lg transition-colors"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 font-semibold text-gray-800 min-w-10 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product._id, item.quantity + 1)}
                          disabled={item.quantity >= product.stock}
                          className="px-3 py-1 hover:bg-gray-50 text-gray-600 font-bold text-lg transition-colors disabled:text-gray-300"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-green-700 text-lg">
                        ${(product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
                Order Summary
              </h2>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({summary.totalQuantity} items)</span>
                  <span>${summary.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  {summary.deliveryFee === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    <span>${summary.deliveryFee?.toFixed(2)}</span>
                  )}
                </div>
                {summary.deliveryFee > 0 && (
                  <p className="text-xs text-gray-400">
                    Add ${(50 - summary.subtotal).toFixed(2)} more for free delivery
                  </p>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-800 text-lg">
                  <span>Total</span>
                  <span className="text-green-700">${summary.total?.toFixed(2)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="block w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-full font-bold text-center text-lg transition-colors"
              >
                Proceed to Checkout →
              </Link>
              <Link
                href="/products"
                className="block w-full mt-3 text-center text-green-600 hover:text-green-700 font-medium text-sm py-2"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
