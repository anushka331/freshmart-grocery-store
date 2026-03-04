/**
 * app/api/seed/route.js
 * POST /api/seed - Seed the database with sample products (development only)
 */

import { NextResponse } from 'next/server'
import dbConnect from '@/app/lib/db'
import Product from '@/app/models/Product'

const sampleProducts = [
  { name: 'Fresh Tomatoes', price: 2.99, originalPrice: 3.99, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400', description: 'Juicy, vine-ripened tomatoes perfect for salads and cooking. Rich in vitamins and antioxidants.', stock: 100, unit: 'kg', tags: ['fresh', 'organic'] },
  { name: 'Organic Potatoes', price: 1.99, originalPrice: 2.49, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', description: 'Farm-fresh organic potatoes. Great for roasting, mashing, or boiling. High in potassium.', stock: 150, unit: 'kg', tags: ['organic', 'fresh'] },
  { name: 'Yellow Onions', price: 1.49, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400', description: 'Sweet yellow onions, essential for cooking. Perfect for soups, stews, and stir-fries.', stock: 200, unit: 'kg', tags: ['fresh', 'cooking-essential'] },
  { name: 'Baby Spinach', price: 3.49, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400', description: 'Tender baby spinach leaves. Packed with iron and vitamins. Ready to eat, pre-washed.', stock: 60, unit: 'pack', tags: ['organic', 'ready-to-eat'] },
  { name: 'Broccoli', price: 2.49, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400', description: 'Fresh broccoli crowns. High in fiber and vitamins C and K. Great steamed or stir-fried.', stock: 80, unit: 'piece', tags: ['fresh', 'healthy'] },
  { name: 'Red Apples', price: 3.99, originalPrice: 4.99, category: 'Fruits', image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400', description: 'Crisp and sweet red apples. A great source of fiber and vitamin C. Perfect for snacking.', stock: 120, unit: 'kg', tags: ['fresh', 'sweet'] },
  { name: 'Bananas', price: 1.29, category: 'Fruits', image: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=400', description: 'Ripe yellow bananas. Rich in potassium and natural sugars. Great for smoothies and snacking.', stock: 200, unit: 'dozen', tags: ['fresh', 'energy-boost'] },
  { name: 'Strawberries', price: 4.99, originalPrice: 5.99, category: 'Fruits', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400', description: 'Sweet, fresh strawberries. Packed with vitamin C and antioxidants. Perfect for desserts.', stock: 50, unit: 'pack', tags: ['fresh', 'sweet', 'seasonal'] },
  { name: 'Mangoes', price: 5.49, category: 'Fruits', image: 'https://images.unsplash.com/photo-1519096845289-95806ee03a1a?w=400', description: 'Sweet Alphonso mangoes, the king of fruits. Rich in vitamins A and C. Tropical delight.', stock: 40, unit: 'kg', tags: ['fresh', 'tropical', 'seasonal'] },
  { name: 'Oranges', price: 3.49, category: 'Fruits', image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400', description: 'Juicy navel oranges. Excellent source of vitamin C. Perfect for juicing or snacking.', stock: 90, unit: 'kg', tags: ['fresh', 'vitamin-c'] },
  { name: 'Whole Milk', price: 3.79, category: 'Dairy', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', description: 'Fresh whole milk from grass-fed cows. Rich in calcium and protein. No artificial additives.', stock: 70, unit: 'litre', tags: ['fresh', 'grass-fed'] },
  { name: 'Greek Yogurt', price: 4.49, category: 'Dairy', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', description: 'Creamy, thick Greek yogurt. High in protein and probiotics. Available in plain flavor.', stock: 55, unit: 'pack', tags: ['probiotic', 'protein-rich'] },
  { name: 'Cheddar Cheese', price: 6.99, originalPrice: 8.49, category: 'Dairy', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400', description: 'Aged sharp cheddar cheese. Rich and flavorful. Perfect for sandwiches, burgers, and cooking.', stock: 45, unit: 'pack', tags: ['aged', 'sharp'] },
  { name: 'Butter', price: 4.99, category: 'Dairy', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400', description: 'Pure unsalted butter made from fresh cream. Perfect for baking and cooking.', stock: 80, unit: 'pack', tags: ['unsalted', 'baking'] },
  { name: 'Potato Chips', price: 3.29, category: 'Snacks', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', description: 'Crispy kettle-cooked potato chips with sea salt. The perfect crunchy snack for any occasion.', stock: 100, unit: 'pack', tags: ['crispy', 'sea-salt'] },
  { name: 'Mixed Nuts', price: 8.99, originalPrice: 10.99, category: 'Snacks', image: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400', description: 'Premium mix of cashews, almonds, walnuts, and pistachios. Healthy and satisfying snack.', stock: 60, unit: 'pack', tags: ['healthy', 'protein-rich', 'premium'] },
  { name: 'Dark Chocolate', price: 4.49, category: 'Snacks', image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400', description: '70% dark chocolate bar. Rich in antioxidants. Smooth, intense chocolate flavor.', stock: 75, unit: 'piece', tags: ['dark', 'antioxidant', 'premium'] },
  { name: 'Granola Bars', price: 5.99, category: 'Snacks', image: 'https://images.unsplash.com/photo-1621510756661-5f1d040d24d8?w=400', description: 'Wholesome oat and honey granola bars with dried fruits. Perfect on-the-go energy snack.', stock: 90, unit: 'pack', tags: ['healthy', 'energy', 'oat'] },
]

export async function POST(request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, message: 'Seeding not allowed in production' }, { status: 403 })
  }

  try {
    await dbConnect()
    await Product.deleteMany({})
    const products = await Product.insertMany(sampleProducts)
    return NextResponse.json({ success: true, message: `Seeded ${products.length} products successfully`, count: products.length })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ success: false, message: 'Seeding failed', error: error.message }, { status: 500 })
  }
}
