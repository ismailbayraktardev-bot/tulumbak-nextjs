'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { Button } from 'tulumbak-ui'
import { useIsAuthenticated, useCurrentUser } from '@/store/auth-store'
import { UserMenu } from '@/components/auth/user-menu'
import { AuthModal } from '@/components/auth/auth-modal'

export function Navbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isAuthenticated = useIsAuthenticated()
  const user = useCurrentUser()
  
  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile-first: Navigation container */}
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo - Mobile optimized */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl sm:text-2xl font-serif font-bold text-tulumbak-amber">
              Tulumbak
            </Link>
          </div>

          {/* Desktop Navigation Links - Hidden on mobile */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/"
                className="text-gray-900 hover:text-tulumbak-amber px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Ana Sayfa
              </Link>
              <Link
                href="/kategori/tulumbalar"
                className="text-gray-900 hover:text-tulumbak-amber px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Tulumbalar
              </Link>
              <Link
                href="/kategori/baklavalar"
                className="text-gray-900 hover:text-tulumbak-amber px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Baklavalar
              </Link>
              <Link
                href="/kategori/sutlaclar"
                className="text-gray-900 hover:text-tulumbak-amber px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sütlaçlar
              </Link>
            </div>
          </div>

          {/* Right side buttons - Mobile optimized */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Cart Button - Mobile touch-friendly */}
            <Link href="/sepet">
              <Button size="sm" variant="outline" className="relative h-10 w-10 sm:w-auto sm:px-4">
                <ShoppingCart className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sepetim</span>
                <span className="absolute -top-2 -right-2 bg-tulumbak-amber text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Button>
            </Link>

            {/* Authentication - Mobile optimized */}
            {isAuthenticated && user ? (
              <UserMenu />
            ) : (
              <Button
                size="sm"
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-tulumbak-amber hover:bg-tulumbak-amber/90 h-10 px-3 sm:px-4 text-sm"
              >
                <span className="hidden sm:inline">Giriş Yap / Kayıt Ol</span>
                <span className="sm:hidden">Giriş</span>
              </Button>
            )}

            {/* Mobile menu button - Only visible on mobile */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="h-10 w-10"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu - Full screen overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-2 space-y-1">
              <Link
                href="/"
                className="text-gray-900 hover:text-tulumbak-amber block px-3 py-3 rounded-md text-base font-medium border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Ana Sayfa
              </Link>
              <Link
                href="/kategori/tulumbalar"
                className="text-gray-900 hover:text-tulumbak-amber block px-3 py-3 rounded-md text-base font-medium border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tulumbalar
              </Link>
              <Link
                href="/kategori/baklavalar"
                className="text-gray-900 hover:text-tulumbak-amber block px-3 py-3 rounded-md text-base font-medium border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Baklavalar
              </Link>
              <Link
                href="/kategori/sutlaclar"
                className="text-gray-900 hover:text-tulumbak-amber block px-3 py-3 rounded-md text-base font-medium border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sütlaçlar
              </Link>

              {/* Mobile Auth Section */}
              <div className="pt-4 pb-3 border-t border-gray-200 mt-2">
                {isAuthenticated && user ? (
                  <div className="px-3">
                    <div className="text-base font-medium text-gray-800">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="mt-3 space-y-1">
                      <Link
                        href="/hesabim"
                        className="block px-3 py-3 rounded-md text-base font-medium text-gray-900 hover:text-tulumbak-amber hover:bg-gray-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Hesabım
                      </Link>
                      <Link
                        href="/siparislerim"
                        className="block px-3 py-3 rounded-md text-base font-medium text-gray-900 hover:text-tulumbak-amber hover:bg-gray-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Siparişlerim
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="px-3">
                    <Button
                      onClick={() => {
                        setIsAuthModalOpen(true)
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full bg-tulumbak-amber hover:bg-tulumbak-amber/90 h-12"
                    >
                      Giriş Yap / Kayıt Ol
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </nav>
  )
}
