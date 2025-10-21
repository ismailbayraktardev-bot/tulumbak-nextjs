'use client'

import { useEffect } from 'react'
import { useAuth, useAuthActions, useAuthError } from '@/store/auth-store'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated } = useAuth()
  const { refreshUser, clearError } = useAuthActions()
  const error = useAuthError()

  useEffect(() => {
    // Clear any authentication errors when component mounts
    clearError()
  }, [clearError])

  useEffect(() => {
    // Refresh user data on app start if user is authenticated
    // Only run once on mount to prevent infinite loop
    const initializeAuth = async () => {
      if (isAuthenticated) {
        try {
          await refreshUser()
        } catch (error) {
          console.warn('Initial user refresh failed:', error)
        }
      }
    }
    
    initializeAuth()
  }, []) // Empty dependency array - run only once on mount

  // Optionally, you could implement auto-refresh token logic here
  useEffect(() => {
    if (!isAuthenticated) return

    // Set up periodic token refresh (every 14 minutes - tokens expire in 15 minutes)
    const refreshInterval = setInterval(() => {
      refreshUser().catch((error) => {
        console.warn('Auto-refresh failed:', error)
        // If auto-refresh fails, the user will need to login again
      })
    }, 14 * 60 * 1000) // 14 minutes

    return () => clearInterval(refreshInterval)
  }, [isAuthenticated]) // Remove refreshUser dependency to prevent loop

  return <>{children}</>
}
