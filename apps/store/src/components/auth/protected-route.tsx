'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useIsAuthenticated, useAuthLoading } from '@/store/auth-store'
import { AuthModal } from './auth-modal'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  showAuthModal?: boolean
}

export function ProtectedRoute({
  children,
  redirectTo = '/',
  showAuthModal = true
}: ProtectedRouteProps) {
  const router = useRouter()
  const isAuthenticated = useIsAuthenticated()
  const isLoading = useAuthLoading()

  useEffect(() => {
    // If not loading and not authenticated, redirect
    if (!isLoading && !isAuthenticated) {
      if (showAuthModal) {
        // Auth modal will be shown by parent component
        return
      }
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, router, redirectTo, showAuthModal])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // If not authenticated and showAuthModal is false, don't render children
  if (!isAuthenticated && !showAuthModal) {
    return null
  }

  // If not authenticated and showAuthModal is true, show auth modal
  if (!isAuthenticated && showAuthModal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Giriş Yapmalısınız
          </h2>
          <p className="text-gray-600 mb-6">
            Bu sayfaya erişmek için lütfen giriş yapın.
          </p>
          <AuthModal
            isOpen={true}
            onClose={() => router.push(redirectTo)}
            onSuccess={() => {
              // Page will re-render automatically when auth state changes
            }}
          />
        </div>
      </div>
    )
  }

  // Authenticated - render children
  return <>{children}</>
}