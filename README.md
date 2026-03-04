# 🌿 FreshMart — Full Stack Grocery E-Commerce

A complete grocery e-commerce web application built with **Next.js 14**, **MongoDB**, and **Tailwind CSS**.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router, React 18) |
| Backend | Next.js API Routes |
| Database | MongoDB with Mongoose ODM |
| Styling | Tailwind CSS |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| HTTP Client | Native fetch API |

---

## 📁 Folder Structure

```
grocery-store/
├── app/
│   ├── api/                        # Backend API Routes
│   │   ├── auth/
│   │   │   ├── register/route.js   # POST - User registration
│   │   │   ├── login/route.js      # POST - User login
│   │   │   ├── logout/route.js     # POST - Clear auth cookie
│   │   │   └── me/route.js         # GET - Current user info
│   │   ├── products/
│   │   │   ├── route.js            # GET all / POST new product
│   │   │   └── [id]/route.js       # GET / PUT / DELETE by ID
│   │   ├── cart/
│   │   │   └── route.js            # GET / POST / PUT / DELETE cart
│   │   ├── orders/
│   │   │   └── route.js            # GET order history / POST place order
│   │   └── seed/
│   │       └── route.js            # POST - seed sample data
│   │
│   ├── components/                 # Reusable React components
│   │   ├── Navbar.js               # Navigation with cart count & auth
│   │   ├── ProductCard.js          # Product display card
│   │   └── ToastProvider.js        # Notification placeholder
│   │
│   ├── context/                    # React Context (global state)
│   │   ├── AuthContext.js          # Auth state + login/logout/register
│   │   └── CartContext.js          # Cart state + add/remove/update
│   │
│   ├── lib/                        # Utility modules
│   │   ├── db.js                   # MongoDB connection (cached)
│   │   └── auth.js                 # JWT generate/verify helpers
│   │
│   ├── models/                     # Mongoose schemas
│   │   ├── User.js                 # User schema (name, email, password, cart)
│   │   ├── Product.js              # Product schema (name, price, category...)
│   │   └── Order.js                # Order schema (userId, products, address)
│   │
│   ├── styles/
│   │   └── globals.css             # Global Tailwind + custom styles
│   │
│   ├── layout.js                   # Root layout with providers & footer
│   ├── page.js                     # Home page
│   ├── products/
│   │   ├── page.js                 # Products listing with filters
│   │   └── [id]/page.js            # Product detail page
│   ├── cart/page.js                # Shopping cart
│   ├── checkout/page.js            # Checkout with address form
│   ├── orders/page.js              # Order history
│   ├── login/page.js               # Login page
│   ├── register/page.js            # Registration page
│   └── admin/page.js               # Admin dashboard
│
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
└── .env.local.example
```

---

## 🗄️ Database Models

### User Model
```js
{
  name: String,           // Required, 2-50 chars
  email: String,          // Required, unique, lowercase
  password: String,       // Hashed with bcrypt (12 rounds)
  role: 'user' | 'admin', // Default: 'user'
  phone: String,
  address: { street, city, state, zipCode, country },
  cart: [{ productId, quantity }],  // Embedded cart
  isActive: Boolean,
  createdAt, updatedAt    // Auto timestamps
}
```

### Product Model
```js
{
  name: String,           // Required
  price: Number,          // Required
  originalPrice: Number,  // Optional (for showing discounts)
  category: Enum,         // Fruits | Vegetables | Dairy | Snacks | ...
  image: String,          // URL
  description: String,    // Required, max 500 chars
  stock: Number,          // Quantity available
  unit: Enum,             // kg | g | litre | piece | pack | ...
  isAvailable: Boolean,
  ratings: { average, count },
  tags: [String]          // e.g. ['organic', 'fresh']
}
```

### Order Model
```js
{
  userId: ObjectId,       // Ref to User
  products: [{
    productId, name, price,  // Snapshot at order time
    quantity, image, category
  }],
  totalPrice: Number,
  subtotal: Number,
  deliveryFee: Number,
  address: { fullName, street, city, state, zipCode, phone },
  paymentMethod: Enum,    // cash_on_delivery | card | upi
  paymentStatus: Enum,    // pending | paid | failed
  orderStatus: Enum,      // placed | confirmed | shipped | delivered
  orderDate: Date,
  estimatedDelivery: Date // Auto: 3 days from order
}
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login + get JWT token |
| POST | `/api/auth/logout` | — | Clear auth cookie |
| GET | `/api/auth/me` | ✅ | Get current user + cart |
| GET | `/api/products` | — | List products (filter: category, search) |
| POST | `/api/products` | Admin | Add new product |
| GET | `/api/products/:id` | — | Get single product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/cart` | ✅ | Get user cart with totals |
| POST | `/api/cart` | ✅ | Add item to cart |
| PUT | `/api/cart` | ✅ | Update item quantity |
| DELETE | `/api/cart?productId=X` | ✅ | Remove item from cart |
| DELETE | `/api/cart?clearAll=true` | ✅ | Clear entire cart |
| GET | `/api/orders` | ✅ | Get user order history |
| POST | `/api/orders` | ✅ | Place a new order |
| POST | `/api/seed` | — | Seed sample grocery products |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### 2. Clone & Install
```bash
git clone <repo-url>
cd grocery-store
npm install
```

### 3. Configure Environment
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017/freshmart
JWT_SECRET=your-random-secret-key-here
```

For MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/freshmart
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Seed Sample Products
- Visit [http://localhost:3000/api/seed](http://localhost:3000/api/seed) in your browser (POST request)
- Or click "Seed Sample Products" on the home page
- Or from the Admin Dashboard > "Seed Sample Data" button

### 6. Create Admin Account
The **first registered user** automatically gets the `admin` role.
Register at `/register` to become admin, then access `/admin`.

---

## ✨ Features

### Customer Features
- Browse all grocery products with images and descriptions
- Filter by category (Fruits, Vegetables, Dairy, Snacks)
- Search products by name/description
- View product details with stock information
- Add/remove items from cart
- Update quantities in cart
- Free delivery on orders over $50
- Checkout with delivery address form
- Choose payment method (Cash, Card, UPI)
- View order history with status tracking

### Admin Features
- Admin dashboard with product statistics
- Add new products with all details
- Edit existing product information
- Delete products (with confirmation)
- Seed sample data for demo

### Security Features
- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens with 7-day expiration
- HTTP-only cookies for SSR auth
- Protected routes (redirect if not logged in)
- Admin-only routes with role checking
- Input validation on all forms and API routes

---

## 🎨 Design
- Organic, nature-inspired color palette (forest green + warm earth tones)
- Playfair Display serif for headings
- DM Sans for body text
- Smooth hover animations and transitions
- Loading skeletons for better UX
- Responsive design (mobile-first)
- Discount badges, stock indicators
- Password strength indicator on registration

---

## 🛒 Sample Products Included
Tomato, Potato, Onion, Baby Spinach, Broccoli, Red Apples, Bananas, Strawberries, Mangoes, Oranges, Whole Milk, Greek Yogurt, Cheddar Cheese, Butter, Potato Chips, Mixed Nuts, Dark Chocolate, Granola Bars
