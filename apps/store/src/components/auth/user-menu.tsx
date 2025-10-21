'use client'

import { useState } from 'react'
import { User, LogOut, ShoppingBag, Package, Settings, ChevronDown } from 'lucide-react'
import { useCurrentUser, useAuthActions } from '@/store/auth-store'
import { Button } from 'tulumbak-ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'tulumbak-ui'

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const user = useCurrentUser()
  const { logout } = useAuthActions()

  const handleLogout = async () => {
    try {
      await logout()
      setIsOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!user) {
    return null
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
            <span className="text-sm font-medium">
              {getInitials(user.first_name, user.last_name)}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">
              {user.first_name} {user.last_name}
            </p>
            {user.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a href="/hesabim" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            <span>Hesabım</span>
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a href="/siparislerim" className="flex items-center gap-2 cursor-pointer">
            <Package className="h-4 w-4" />
            <span>Siparişlerim</span>
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a href="/sepetim" className="flex items-center gap-2 cursor-pointer">
            <ShoppingBag className="h-4 w-4" />
            <span>Sepetim</span>
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a href="/ayarlar" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            <span>Ayarlar</span>
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          <span>Çıkış Yap</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}