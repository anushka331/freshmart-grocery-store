
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = ['Fruits', 'Vegetables', 'Dairy', 'Snacks', 'Beverages', 'Bakery', 'Meat', 'Frozen']
const UNITS = ['kg', 'g', 'litre', 'ml', 'piece', 'dozen', 'pack', 'lb']
const defaultForm = { name: '', price: '', originalPrice: '', category: 'Fruits', image: '', description: '', stock: '', unit: 'kg', tags: '' }

export default function AdminPage() {
  const { user, loading, authFetch } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [form, setForm] = useState(defaultForm)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [activeTab, setActiveTab] = useState('products')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push('/login'); return }
      if (user.role !== 'admin') { router.push('/'); return }
    }
  }, [user, loading])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=100')
      const data = await res.json()
      if (data.success) setProducts(data.products)
    } finally {
      setProductsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') fetchProducts()
  }, [user])

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.category || !form.image || !form.description) {
      showMessage('Please fill in all required fields', 'error'); return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        stock: parseInt(form.stock) || 0,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      const url = editingId ? `/api/products/${editingId}` : '/api/products'
      const method = editingId ? 'PUT' : 'POST'
      const res = await authFetch(url, { method, body: JSON.stringify(payload) })
      const data = await res.json()
      if (data.success) {
        showMessage(editingId ? 'Product updated!' : 'Product added!')
        setForm(defaultForm)
        setEditingId(null)
        fetchProducts()
        setActiveTab('products')
      } else {
        showMessage(data.message || 'Failed', 'error')
      }
    } catch (err) {
      showMessage('Network error', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      category: product.category,
      image: product.image,
      description: product.description,
      stock: product.stock.toString(),
      unit: product.unit || 'kg',
      tags: product.tags?.join(', ') || '',
    })
    setEditingId(product._id)
    setActiveTab('add')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (productId) => {
    try {
      const res = await authFetch(`/api/products/${productId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        showMessage('Product deleted')
        setProducts(products.filter(p => p._id !== productId))
      } else {
        showMessage(data.message || 'Delete failed', 'error')
      }
    } catch (err) {
      showMessage('Network error', 'error')
    } finally {
      setDeleteConfirm(null)
    }
  }

  const handleSeed = async () => {
    const res = await fetch('/api/seed', { method: 'POST' })
    const data = await res.json()
    if (data.success) { showMessage(`Seeded ${data.count} products`); fetchProducts() }
    else showMessage(data.message, 'error')
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user || user.role !== 'admin') return null

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 focus:bg-white text-gray-800 transition-colors text-sm"

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your FreshMart store</p>
        </div>
        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">Admin</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Products', value: products.length, icon: '📦', bg: '#eff6ff', color: '#1d4ed8' },
          { label: 'In Stock', value: products.filter(p => p.stock > 0).length, icon: '✅', bg: '#f0fdf4', color: '#15803d' },
          { label: 'Out of Stock', value: products.filter(p => p.stock === 0).length, icon: '⚠️', bg: '#fef2f2', color: '#dc2626' },
          { label: 'Categories', value: new Set(products.map(p => p.category)).size, icon: '🏷️', bg: '#faf5ff', color: '#7e22ce' },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl p-4" style={{ backgroundColor: stat.bg, color: stat.color }}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs font-medium opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      {message.text && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[{ id: 'products', label: `Products (${products.length})` }, { id: 'add', label: editingId ? 'Edit Product' : '+ Add Product' }].map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); if (tab.id === 'add' && !editingId) { setForm(defaultForm); setEditingId(null) } }}
            className={`px-5 py-2.5 font-semibold text-sm border-b-2 -mb-px transition-colors ${activeTab === tab.id ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">All Products</h2>
            <button onClick={handleSeed} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors">
              Seed Sample Data
            </button>
          </div>
          {productsLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 shimmer rounded-xl" />)}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">📦</div>
              <p className="text-gray-500 mb-4">No products yet</p>
              <button onClick={() => setActiveTab('add')} className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold">Add First Product</button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-green-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: '#f0fdf4' }}>
                    <tr>{['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-green-50">
                    {products.map(product => (
                      <tr key={product._id} className="hover:bg-green-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" onError={e => { e.target.style.display = 'none' }} />
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                              <p className="text-xs text-gray-400 truncate max-w-48">{product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{product.category}</span></td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-gray-800">${product.price.toFixed(2)}</div>
                          {product.originalPrice && <div className="text-xs text-gray-400 line-through">${product.originalPrice.toFixed(2)}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${product.stock > 10 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                            {product.stock} {product.unit}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(product)} className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold">Edit</button>
                            {deleteConfirm === product._id ? (
                              <div className="flex gap-1">
                                <button onClick={() => handleDelete(product._id)} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">Confirm</button>
                                <button onClick={() => setDeleteConfirm(null)} className="bg-gray-100 text-gray-600 px-2 py-1.5 rounded-lg text-xs">Cancel</button>
                              </div>
                            ) : (
                              <button onClick={() => setDeleteConfirm(product._id)} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold">Delete</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'add' && (
        <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm max-w-2xl">
          <h2 className="text-xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            {editingId ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g., Fresh Tomatoes" className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price ($) *</label>
                <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="2.99" min="0" step="0.01" className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Original Price ($)</label>
                <input type="number" name="originalPrice" value={form.originalPrice} onChange={handleChange} placeholder="3.99" min="0" step="0.01" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                <select name="category" value={form.category} onChange={handleChange} className={inputClass} required>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit</label>
                <select name="unit" value={form.unit} onChange={handleChange} className={inputClass}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Quantity</label>
                <input type="number" name="stock" value={form.stock} onChange={handleChange} placeholder="100" min="0" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma-separated)</label>
                <input type="text" name="tags" value={form.tags} onChange={handleChange} placeholder="fresh, organic" className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL *</label>
                <input type="url" name="image" value={form.image} onChange={handleChange} placeholder="https://images.unsplash.com/..." className={inputClass} required />
                {form.image && <img src={form.image} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-lg border border-green-100" onError={e => { e.target.style.display = 'none' }} />}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the product..." rows={3} className={inputClass} required />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold transition-all disabled:opacity-60">
                {submitting ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setForm(defaultForm); setEditingId(null) }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
