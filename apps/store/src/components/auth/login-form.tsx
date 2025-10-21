'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { loginSchema, type LoginFormData } from '@/lib/auth-validation'
import { useAuthActions, useAuthError, useAuthLoading } from '@/store/auth-store'
import { Button } from 'tulumbak-ui'
import { Input } from 'tulumbak-ui'
import { Label } from 'tulumbak-ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'tulumbak-ui'

interface LoginFormProps {
  onSuccess?: () => void
  onRegisterClick?: () => void
}

export function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuthActions()
  const error = useAuthError()
  const isLoading = useAuthLoading()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password)
      onSuccess?.()
    } catch (error) {
      // Error is handled by the auth store
      console.error('Login failed:', error)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Hoş Geldiniz
        </CardTitle>
        <CardDescription className="text-center">
          Tulumbak hesabınıza giriş yapın
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@email.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Global Error */}
          {error && (
            <div className="rounded-md bg-red-50 p-3 border border-red-200">
              <p className="text-sm text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Giriş Yapılıyor...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Giriş Yap
              </div>
            )}
          </Button>

          {/* Register Link */}
          {onRegisterClick && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Hesabınız yok mu?{' '}
                <button
                  type="button"
                  onClick={onRegisterClick}
                  className="text-blue-600 hover:text-blue-800 font-medium underline"
                  disabled={isLoading}
                >
                  Kayıt Ol
                </button>
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}