'use client'
/**
 * app/products/page.js
 * Products listing page with category filters and search
 */

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ProductCard from '../components/ProductCard'

const CATEGORIES = ['All', 'Fruits', 'Vegetables', 'Dairy', 'Snacks']
const categoryEmoji = { All: '🛒', Fruits: '🍎', Vegetables: '🥦', Dairy: '🥛', Snacks: '🍪' }

function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [totalProducts, setTotalProducts] = useState(0)

  const category = searchParams.get('category') || 'All'

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'All') params.set('category', category)
      if (search) params.set('search', search)
      params.set('limit', '50')
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      if (data.success) {
        setProducts(data.products)
        setTotalProducts(data.pagination.total)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [category, search])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const handleCategoryChange = (cat) => {
    if (cat === 'All') {
      router.push('/products')
    } else {
      router.push(`/products?category=${cat}`)
    }
    setSearch('')
    setSearchInput('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          {category === 'All' ? 'All Products' : category}
        </h1>
        <p className="text-gray-500">{totalProducts} products available</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-3 max-w-lg">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 border border-green-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-gray-800"
          />
        </div>
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-full font-semibold transition-colors">
          Search
        </button>
        {search && (
          <button type="button" onClick={() => { setSearch(''); setSearchInput('') }} className="text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
            Clear
          </button>
        )}
      </form>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
              category === cat
                ? 'bg-green-600 text-white border-green-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-700'
            }`}
          >
            <span>{categoryEmoji[cat]}</span>
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-500">Try a different search or category</p>
        </div>
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-64"><div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <ProductsContent />
    </Suspense>
  )
}
