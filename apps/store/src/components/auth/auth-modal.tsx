'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { LoginForm } from './login-form'
import { RegisterForm } from './register-form'
import { Button } from 'tulumbak-ui'
import { Dialog, DialogContent, DialogTitle } from 'tulumbak-ui'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialView?: 'login' | 'register'
  onSuccess?: () => void
}

export function AuthModal({ isOpen, onClose, initialView = 'login', onSuccess }: AuthModalProps) {
  const [currentView, setCurrentView] = useState<'login' | 'register'>(initialView)

  const handleSuccess = () => {
    onSuccess?.()
    onClose()
  }

  const handleClose = () => {
    setCurrentView('login') // Reset to login view when closing
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 max-w-md w-full">
        {/* Visually Hidden DialogTitle for Accessibility */}
        <DialogTitle className="sr-only">
          {currentView === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
        </DialogTitle>
        
        <div className="relative">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Kapat</span>
          </Button>

          {/* Auth Forms */}
          <div className="p-6 pt-8">
            {currentView === 'login' ? (
              <LoginForm
                onSuccess={handleSuccess}
                onRegisterClick={() => setCurrentView('register')}
              />
            ) : (
              <RegisterForm
                onSuccess={handleSuccess}
                onLoginClick={() => setCurrentView('login')}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}