'use client'
/**
 * app/orders/page.js
 * Order history page
 */

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'

const statusColors = {
  placed: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-purple-100 text-purple-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const statusEmoji = {
  placed: '📋', confirmed: '✅', processing: '🔄', shipped: '🚚', delivered: '📦', cancelled: '❌'
}

function OrdersContent() {
  const { user, loading, authFetch } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const isSuccess = searchParams.get('success') === 'true'
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    if (!user) return
    const fetchOrders = async () => {
      try {
        const res = await authFetch('/api/orders')
        const data = await res.json()
        if (data.success) setOrders(data.orders)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setOrdersLoading(false)
      }
    }
    fetchOrders()
  }, [user])

  if (loading || ordersLoading) return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-32 shimmer rounded-2xl" />)}
      </div>
    </div>
  )

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Success Banner */}
      {isSuccess && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Order Placed Successfully!
          </h2>
          <p className="text-green-700">
            Your order #{orderId?.slice(-8).toUpperCase()} has been received. We will deliver it within 3 business days.
          </p>
          <Link href="/products" className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-semibold transition-colors">
            Continue Shopping
          </Link>
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-800 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-7xl mb-4">📦</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">No orders yet</h2>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
          <Link href="/products" className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold transition-colors">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
              {/* Order Header */}
              <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Order ID</p>
                  <p className="font-mono text-sm font-semibold text-gray-700">#{order._id.slice(-10).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Date</p>
                  <p className="text-sm text-gray-700">{new Date(order.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Total</p>
                  <p className="text-lg font-bold text-green-700">${order.totalPrice.toFixed(2)}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                  {statusEmoji[order.orderStatus]} {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                </span>
              </div>

              {/* Order Products */}
              <div className="p-5">
                <div className="space-y-3">
                  {order.products.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-green-100" onError={(e) => { e.target.style.display = 'none' }} />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.category} · Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-700">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Delivery to</p>
                  <p className="text-sm text-gray-700">
                    {order.address?.fullName}, {order.address?.street}, {order.address?.city}, {order.address?.state} {order.address?.zipCode}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <OrdersContent />
    </Suspense>
  )
}
