'use client'

import Link from 'next/link'
import { Button } from 'tulumbak-ui'

export function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-serif font-bold text-tulumbak-amber">
              Tulumbak
            </Link>
          </div>

          {/* Navigation Links */}
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

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <Button size="sm" className="bg-tulumbak-amber hover:bg-tulumbak-amber/90">
              Sepetim (0)
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
