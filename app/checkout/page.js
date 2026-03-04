'use client'
/**
 * app/checkout/page.js
 * Checkout page - address and payment
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function CheckoutPage() {
  const { cart, summary, fetchCart } = useCart()
  const { user, loading, authFetch } = useAuth()
  const router = useRouter()
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery')

  useEffect(() => {
    if (!loading && !user) { router.push('/login'); return }
    if (user) {
      setFormData(prev => ({ ...prev, fullName: user.name || '' }))
    }
  }, [user, loading])

  useEffect(() => {
    if (!loading && user && cart.length === 0) {
      router.push('/cart')
    }
  }, [cart, loading, user])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    const { fullName, street, city, state, zipCode } = formData
    if (!fullName || !street || !city || !state || !zipCode) {
      setError('Please fill in all required address fields.')
      return
    }
    setPlacing(true)
    setError('')
    try {
      const res = await authFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ address: formData, paymentMethod }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchCart()
        router.push(`/orders?success=true&orderId=${data.order._id}`)
      } else {
        setError(data.message || 'Failed to place order')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-64"><div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
        Checkout
      </h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Address + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
                📍 Delivery Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'fullName', label: 'Full Name *', placeholder: 'John Doe', span: 2 },
                  { name: 'street', label: 'Street Address *', placeholder: '123 Main St', span: 2 },
                  { name: 'city', label: 'City *', placeholder: 'New York' },
                  { name: 'state', label: 'State *', placeholder: 'NY' },
                  { name: 'zipCode', label: 'ZIP Code *', placeholder: '10001' },
                  { name: 'phone', label: 'Phone Number', placeholder: '+1 234 567 8900' },
                ].map(field => (
                  <div key={field.name} className={field.span === 2 ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                    <input
                      type="text"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 bg-gray-50 focus:bg-white transition-colors"
                      required={field.label.includes('*')}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
                💳 Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'cash_on_delivery', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
                  { value: 'card', label: 'Credit/Debit Card', icon: '💳', desc: 'Visa, Mastercard, Amex' },
                  { value: 'upi', label: 'UPI Payment', icon: '📱', desc: 'Pay using UPI apps' },
                ].map(method => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === method.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-green-600"
                    />
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-800">{method.label}</div>
                      <div className="text-sm text-gray-500">{method.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Order Summary
              </h2>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.map(item => {
                  const p = item.productId
                  if (!p) return null
                  return (
                    <div key={item._id} className="flex gap-3 items-center">
                      <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-green-700">${(p.price * item.quantity).toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span><span>${summary.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Delivery</span>
                  <span className={summary.deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                    {summary.deliveryFee === 0 ? 'FREE' : `$${summary.deliveryFee?.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 text-lg pt-2 border-t border-gray-100">
                  <span>Total</span><span className="text-green-700">${summary.total?.toFixed(2)}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={placing}
                className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white py-4 rounded-full font-bold text-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {placing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Placing Order...
                  </span>
                ) : '✅ Place Order'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
