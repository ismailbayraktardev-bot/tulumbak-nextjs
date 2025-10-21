// Authentication Types for Store App
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  role: 'customer' | 'admin' | 'super_admin'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
}

export interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
}

export interface LoginResponse {
  success: boolean
  data: {
    user: User
    accessToken: string
    refreshToken: string
  }
}

export interface AuthResponse {
  success: boolean
  data: User
}

export interface RefreshResponse {
  success: boolean
  data: {
    accessToken: string
    refreshToken: string
  }
}

// API Error Response
export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    fields?: Record<string, string>
  }
}