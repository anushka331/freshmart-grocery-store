import './styles/globals.css'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'

export const metadata = {
  title: 'FreshMart — Fresh Groceries Delivered',
  description: 'Order fresh fruits, vegetables, dairy, and snacks online.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen" style={{ backgroundColor: '#f0fdf4', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <footer style={{ backgroundColor: '#14532d', color: 'white' }} className="py-12 mt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="col-span-2">
                    <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>🌿 FreshMart</h3>
                    <p style={{ color: '#86efac' }} className="text-sm leading-relaxed max-w-xs">
                      Bringing the freshest produce from local farms directly to your kitchen. Quality you can taste, convenience you will love.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 uppercase text-xs tracking-wider" style={{ color: '#4ade80' }}>Shop</h4>
                    <ul className="space-y-2 text-sm" style={{ color: '#86efac' }}>
                      {['Fruits', 'Vegetables', 'Dairy', 'Snacks'].map(c => (
                        <li key={c}><a href={`/products?category=${c}`} className="hover:text-white transition-colors">{c}</a></li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 uppercase text-xs tracking-wider" style={{ color: '#4ade80' }}>Account</h4>
                    <ul className="space-y-2 text-sm" style={{ color: '#86efac' }}>
                      {[['Login', '/login'], ['Register', '/register'], ['My Cart', '/cart'], ['Orders', '/orders']].map(([label, href]) => (
                        <li key={href}><a href={href} className="hover:text-white transition-colors">{label}</a></li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="border-t border-green-800 mt-8 pt-6 text-center text-xs" style={{ color: '#4ade80' }}>
                  <p>© {new Date().getFullYear()} FreshMart. Built with Next.js and MongoDB.</p>
                </div>
              </div>
            </footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
