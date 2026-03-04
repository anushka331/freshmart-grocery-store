'use client'
/**
 * app/page.js
 * Home page - hero section and featured products
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProductCard from './components/ProductCard'

const categories = [
  { name: 'Fruits', emoji: '🍎', color: '#fef3c7', border: '#fcd34d' },
  { name: 'Vegetables', emoji: '🥦', color: '#dcfce7', border: '#86efac' },
  { name: 'Dairy', emoji: '🥛', color: '#e0f2fe', border: '#7dd3fc' },
  { name: 'Snacks', emoji: '🍪', color: '#fce7f3', border: '#f9a8d4' },
]

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=8')
        const data = await res.json()
        if (data.success) setFeaturedProducts(data.products)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 40%, #15803d 100%)' }} className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center bg-green-700 text-green-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                🚚 Free delivery on orders over $50
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                Farm Fresh,
                <br />
                <span style={{ color: '#fcd34d' }}>Delivered Fast</span>
              </h1>
              <p className="text-green-200 text-lg mb-8 leading-relaxed max-w-md">
                Shop the finest fruits, vegetables, dairy, and more. Direct from local farms to your doorstep, always fresh and always delicious.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center bg-yellow-400 hover:bg-yellow-300 text-green-900 font-bold px-8 py-3 rounded-full text-lg transition-all hover:shadow-lg"
                >
                  Shop Now →
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center border-2 border-green-400 text-green-200 hover:bg-green-700 font-semibold px-8 py-3 rounded-full text-lg transition-all"
                >
                  Sign Up Free
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-10">
                {[['1000+', 'Products'], ['50+', 'Brands'], ['24/7', 'Delivery']].map(([num, label]) => (
                  <div key={label} className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{num}</div>
                    <div className="text-green-300 text-sm">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #4ade80, transparent)' }} />
                <div className="grid grid-cols-2 gap-4 p-8">
                  {['🍅', '🥦', '🍎', '🥛'].map((emoji, i) => (
                    <div key={i} className="flex items-center justify-center w-28 h-28 bg-white/10 backdrop-blur-sm rounded-2xl text-5xl border border-white/20 hover:bg-white/20 transition-all cursor-default">
                      {emoji}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-green-50/30" style={{ clipPath: 'ellipse(100% 100% at 50% 100%)' }} />
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/products?category=${cat.name}`}
              className="group flex flex-col items-center p-6 rounded-2xl border-2 transition-all hover:shadow-md hover:-translate-y-1"
              style={{ backgroundColor: cat.color, borderColor: cat.border }}
            >
              <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">{cat.emoji}</span>
              <span className="font-semibold text-gray-700 text-lg">{cat.name}</span>
              <span className="text-sm text-gray-500 mt-1">Browse all →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
            Featured Products
          </h2>
          <Link href="/products" className="text-green-600 hover:text-green-700 font-semibold text-sm">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-green-100">
                <div className="h-48 shimmer" />
                <div className="p-4 space-y-2">
                  <div className="h-4 shimmer rounded" />
                  <div className="h-3 shimmer rounded w-2/3" />
                  <div className="h-8 shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products yet</h3>
            <p className="text-gray-500 mb-6">Seed the database to see products here.</p>
            <button
              onClick={async () => {
                const res = await fetch('/api/seed', { method: 'POST' })
                const data = await res.json()
                if (data.success) window.location.reload()
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-semibold transition-colors"
            >
              Seed Sample Products
            </button>
          </div>
        )}
      </section>

      {/* Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Fresh Deals Every Day! 🌟
            </h3>
            <p className="text-amber-700">Sign up today and get 10% off your first order</p>
          </div>
          <Link
            href="/register"
            className="flex-shrink-0 bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-colors"
          >
            Claim Offer
          </Link>
        </div>
      </section>
    </div>
  )
}
