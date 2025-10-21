'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from 'tulumbak-ui'

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Ürünler', href: '/products', icon: '🍰' },
  { name: 'Kategoriler', href: '/categories', icon: '📁' },
  { name: 'Siparişler', href: '/orders', icon: '📦' },
  { name: 'Müşteriler', href: '/customers', icon: '👥' },
  { name: 'Raporlar', href: '/reports', icon: '📈' },
  { name: 'Ayarlar', href: '/settings', icon: '⚙️' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-tulumbak-slate">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-serif font-bold text-tulumbak-amber">
          Tulumbak Admin
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-tulumbak-amber text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-tulumbak-amber flex items-center justify-center">
              <span className="text-sm font-medium text-white">A</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-gray-300">admin@tulumbak.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
