'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, UserPlus, AlertCircle, Check, X } from 'lucide-react'
import { registerSchema, type RegisterFormData, checkPasswordStrength, formatPhoneNumber } from '@/lib/auth-validation'
import { useAuthActions, useAuthError, useAuthLoading } from '@/store/auth-store'
import { Button } from 'tulumbak-ui'
import { Input } from 'tulumbak-ui'
import { Label } from 'tulumbak-ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'tulumbak-ui'

interface RegisterFormProps {
  onSuccess?: () => void
  onLoginClick?: () => void
}

export function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const { register } = useAuthActions()
  const error = useAuthError()
  const isLoading = useAuthLoading()

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      acceptTerms: false,
    },
  })

  // Watch password for strength indicator
  const password = useWatch({ control, name: 'password' })
  const passwordStrength = password ? checkPasswordStrength(password) : { score: 0, feedback: [] }

  // Watch phone for formatting
  const phone = useWatch({ control, name: 'phone' })
  const formattedPhone = phone ? formatPhoneNumber(phone) : ''

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Clean phone number (remove formatting)
      const cleanData = {
        ...data,
        phone: data.phone ? data.phone.replace(/[^0-9]/g, '') : undefined,
      }

      await register(cleanData)
      onSuccess?.()
    } catch (error) {
      // Error is handled by the auth store
      console.error('Registration failed:', error)
    }
  }

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500'
    if (score <= 3) return 'bg-yellow-500'
    if (score <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = (score: number) => {
    if (score <= 2) return 'Zayıf'
    if (score <= 3) return 'Orta'
    if (score <= 4) return 'İyi'
    return 'Güçlü'
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Hesap Oluştur
        </CardTitle>
        <CardDescription className="text-center">
          Tulumbak hesabınızı oluşturun
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Ad</Label>
              <Input
                id="first_name"
                placeholder="Ahmet"
                {...registerField('first_name')}
                className={errors.first_name ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.first_name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Soyad</Label>
              <Input
                id="last_name"
                placeholder="Yılmaz"
                {...registerField('last_name')}
                className={errors.last_name ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.last_name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@email.com"
              {...registerField('email')}
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

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon (İsteğe Bağlı)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="5XX XXX XX XX"
              value={formattedPhone}
              {...registerField('phone')}
              className={errors.phone ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.phone.message}
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
                {...registerField('password')}
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

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 min-w-[40px]">
                    {getPasswordStrengthText(passwordStrength.score)}
                  </span>
                </div>

                {passwordStrength.feedback.length > 0 && (
                  <div className="text-xs text-gray-600">
                    <p>Eksik olanlar:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {errors.password && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <input
                id="acceptTerms"
                type="checkbox"
                {...registerField('acceptTerms')}
                className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                disabled={isLoading}
              />
              <Label htmlFor="acceptTerms" className="text-sm text-gray-600 leading-normal">
                <a href="/kullanim-kosullari" className="text-blue-600 hover:text-blue-800 underline">
                  Kullanım Koşulları
                </a>
                'nı ve{' '}
                <a href="/gizlilik-politikasi" className="text-blue-600 hover:text-blue-800 underline">
                  Gizlilik Politikası
                </a>
                'nı okudum ve kabul ediyorum.
              </Label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.acceptTerms.message}
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
                Kayıt Yapılıyor...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Hesap Oluştur
              </div>
            )}
          </Button>

          {/* Login Link */}
          {onLoginClick && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Zaten hesabınız var mı?{' '}
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="text-blue-600 hover:text-blue-800 font-medium underline"
                  disabled={isLoading}
                >
                  Giriş Yap
                </button>
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}