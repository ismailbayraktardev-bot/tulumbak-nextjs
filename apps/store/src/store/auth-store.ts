import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AuthState, AuthActions, User, LoginResponse, RegisterData, ApiError } from '@/lib/auth-types'

// Mock data for development - Use fixed dates to prevent hydration issues
const mockUser: User = {
  id: 'user_123',
  email: 'test@tulumbak.com',
  first_name: 'Test',
  last_name: 'Kullanıcı',
  phone: '+905321234567',
  role: 'customer',
  is_active: true,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
}

const mockLoginResponse: LoginResponse = {
  success: true,
  data: {
    user: mockUser,
    accessToken: 'mock_access_token',
    refreshToken: 'mock_refresh_token',
  },
}

// API functions for authentication (with mock fallback)
const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    // Development mode: use mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Using mock login')
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      return mockLoginResponse
    }

    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error: ApiError = await response.json()
      throw new Error(error.error?.message || 'Giriş başarısız')
    }

    return response.json()
  },

  async register(userData: RegisterData): Promise<LoginResponse> {
    // Development mode: use mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Using mock register')
      await new Promise(resolve => setTimeout(resolve, 1000))
      return mockLoginResponse
    }

    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const error: ApiError = await response.json()
      throw new Error(error.error?.message || 'Kayıt başarısız')
    }

    return response.json()
  },

  async logout(): Promise<void> {
    // Development mode: just log
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Mock logout')
      return
    }

    const response = await fetch('http://localhost:3001/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // Important for cookies
    })

    if (!response.ok) {
      console.warn('Logout API call failed:', response.status)
    }
  },

  async getCurrentUser(): Promise<User> {
    // Development mode: use mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Using mock getCurrentUser')
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockUser
    }

    const response = await fetch('http://localhost:3001/api/auth/me', {
      method: 'GET',
      credentials: 'include', // Important for cookies
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Oturum süresi dolmuş')
      }
      throw new Error('Kullanıcı bilgileri alınamadı')
    }

    const result = await response.json()
    return result.data
  },

  async refreshToken(): Promise<void> {
    // Development mode: just log
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Mock token refresh')
      return
    }

    const response = await fetch('http://localhost:3001/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Important for cookies
    })

    if (!response.ok) {
      throw new Error('Token yenileme başarısız')
    }
  },
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authApi.login(email, password)

          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Giriş başarısız',
          })
          throw error
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authApi.register(userData)

          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Kayıt başarısız',
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })

        try {
          await authApi.logout()
        } catch (error) {
          console.warn('Logout API call failed:', error)
        } finally {
          // Always clear local state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      refreshUser: async () => {
        const { isAuthenticated } = get()

        if (!isAuthenticated) {
          return
        }

        set({ isLoading: true })

        try {
          const user = await authApi.getCurrentUser()

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          // If refresh fails, try to refresh token
          try {
            await authApi.refreshToken()
            const user = await authApi.getCurrentUser()

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } catch (refreshError) {
            // If token refresh also fails, logout
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Oturum süresi dolmuş',
            })
          }
        }
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist essential data
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Rehydrate on app start
      onRehydrateStorage: () => (state) => {
        // Don't call refreshUser here to prevent infinite loop
        // Just rehydrate the persisted state
        console.log('Auth store rehydrated:', state?.isAuthenticated ? 'authenticated' : 'not authenticated')
      },
    }
  )
)

// Selectors for easier access - Use individual selectors to prevent infinite loops
export const useAuth = () => {
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const error = useAuthStore((state) => state.error)
  
  return {
    user,
    isLoading,
    isAuthenticated,
    error,
  }
}

// Individual selectors to prevent infinite loops
export const useAuthActions = () => {
  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)
  const logout = useAuthStore((state) => state.logout)
  const refreshUser = useAuthStore((state) => state.refreshUser)
  const clearError = useAuthStore((state) => state.clearError)
  
  return {
    login,
    register,
    logout,
    refreshUser,
    clearError,
  }
}

export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useCurrentUser = () => useAuthStore((state) => state.user)
export const useAuthError = () => useAuthStore((state) => state.error)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
