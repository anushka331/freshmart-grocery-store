/**
 * lib/auth.js
 * JWT authentication utilities
 */

import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object with _id, email, role
 * @returns {string} JWT token
 */
export function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'user',
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

/**
 * Extract token from request headers or cookies
 * @param {Request} request - Next.js request object
 * @returns {string|null} Token or null
 */
export function getTokenFromRequest(request) {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Try cookie
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [key, ...val] = c.trim().split('=')
        return [key, val.join('=')]
      })
    )
    return cookies.token || null
  }

  return null
}

/**
 * Authenticate a request - middleware helper
 * @param {Request} request - Next.js request object
 * @returns {Object} { user, error }
 */
export function authenticate(request) {
  const token = getTokenFromRequest(request)

  if (!token) {
    return { user: null, error: 'No token provided' }
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return { user: null, error: 'Invalid or expired token' }
  }

  return { user: decoded, error: null }
}

/**
 * Check if user is admin
 */
export function isAdmin(user) {
  return user && user.role === 'admin'
}
