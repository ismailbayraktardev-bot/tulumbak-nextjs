import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production'

export interface JWTPayload {
  userId: string
  email: string
  role: 'customer' | 'admin' | 'super_admin'
  name: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export class AuthService {
  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  /**
   * Generate access token (short-lived)
   */
  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '15m',
      issuer: 'tulumbak-api',
      audience: 'tulumbak-apps'
    })
  }

  /**
   * Generate refresh token (long-lived)
   */
  static generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'refresh' },
      JWT_REFRESH_SECRET,
      {
        expiresIn: '7d',
        issuer: 'tulumbak-api',
        audience: 'tulumbak-apps'
      }
    )
  }

  /**
   * Generate token pair
   */
  static generateTokenPair(payload: JWTPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload.userId)
    }
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'tulumbak-api',
        audience: 'tulumbak-apps'
      }) as JWTPayload

      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired')
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token')
      }
      throw new Error('Token verification failed')
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): { userId: string; type: string } {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: 'tulumbak-api',
        audience: 'tulumbak-apps'
      }) as { userId: string; type: string }

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type')
      }

      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired')
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token')
      }
      throw new Error('Refresh token verification failed')
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): any {
    try {
      return jwt.decode(token)
    } catch (error) {
      return null
    }
  }

  /**
   * Check if token will expire soon (within 5 minutes)
   */
  static willExpireSoon(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any
      if (!decoded || !decoded.exp) return true

      const now = Math.floor(Date.now() / 1000)
      const fiveMinutes = 5 * 60

      return decoded.exp - now < fiveMinutes
    } catch (error) {
      return true
    }
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }

  return parts[1]
}

/**
 * Get token from request (Authorization header or cookie)
 */
export function getTokenFromRequest(request: Request): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization')
  const tokenFromHeader = extractTokenFromHeader(authHeader)
  if (tokenFromHeader) return tokenFromHeader

  // Fall back to cookie (for web clients)
  const tokenFromCookie = getCookieFromRequest(request, 'access_token')
  return tokenFromCookie
}

/**
 * Helper function to get cookie from request
 */
function getCookieFromRequest(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').map(cookie => cookie.trim())
  const targetCookie = cookies.find(cookie => cookie.startsWith(`${name}=`))

  if (!targetCookie) return null

  return targetCookie.substring(name.length + 1)
}

/**
 * Authentication middleware result
 */
export interface AuthResult {
  success: boolean
  user?: JWTPayload
  error?: string
}

/**
 * Authenticate user from request
 */
export function authenticateRequest(request: Request): AuthResult {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return {
        success: false,
        error: 'No authentication token provided'
      }
    }

    const user = AuthService.verifyAccessToken(token)
    return {
      success: true,
      user
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed'
    }
  }
}

/**
 * Check if user has required role
 */
export function hasRequiredRole(user: JWTPayload, requiredRole: string): boolean {
  const roleHierarchy = {
    'customer': 1,
    'admin': 2,
    'super_admin': 3
  }

  const userLevel = roleHierarchy[user.role] || 0
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

  return userLevel >= requiredLevel
}

/**
 * Role-based access control
 */
export function authorize(user: JWTPayload, requiredRole: string): AuthResult {
  if (!hasRequiredRole(user, requiredRole)) {
    return {
      success: false,
      error: 'Insufficient permissions'
    }
  }

  return {
    success: true,
    user
  }
}