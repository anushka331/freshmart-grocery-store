'use client'
/**
 * app/context/CartContext.js
 * Global cart state management
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [summary, setSummary] = useState({ itemCount: 0, subtotal: 0, deliveryFee: 0, total: 0 })
  const [cartLoading, setCartLoading] = useState(false)
  const { user, authFetch } = useAuth()

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart([])
      setSummary({ itemCount: 0, subtotal: 0, deliveryFee: 0, total: 0 })
      return
    }

    try {
      setCartLoading(true)
      const res = await authFetch('/api/cart')
      const data = await res.json()
      if (data.success) {
        setCart(data.cart || [])
        setSummary(data.summary || { itemCount: 0, subtotal: 0, deliveryFee: 0, total: 0 })
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setCartLoading(false)
    }
  }, [user, authFetch])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addToCart = async (productId, quantity = 1) => {
    if (!user) return { success: false, message: 'Please login to add items to cart' }

    try {
      const res = await authFetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      })
      const data = await res.json()
      if (data.success) await fetchCart()
      return data
    } catch (error) {
      return { success: false, message: 'Failed to add to cart' }
    }
  }

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await authFetch('/api/cart', {
        method: 'PUT',
        body: JSON.stringify({ productId, quantity }),
      })
      const data = await res.json()
      if (data.success) await fetchCart()
      return data
    } catch (error) {
      return { success: false, message: 'Failed to update cart' }
    }
  }

  const removeFromCart = async (productId) => {
    try {
      const res = await authFetch(`/api/cart?productId=${productId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) await fetchCart()
      return data
    } catch (error) {
      return { success: false, message: 'Failed to remove item' }
    }
  }

  const clearCart = async () => {
    try {
      const res = await authFetch('/api/cart?clearAll=true', { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setCart([])
        setSummary({ itemCount: 0, subtotal: 0, deliveryFee: 0, total: 0 })
      }
      return data
    } catch (error) {
      return { success: false, message: 'Failed to clear cart' }
    }
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, summary, cartLoading, cartCount, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
