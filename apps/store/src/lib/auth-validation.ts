import { z } from 'zod'

// Turkish validation messages
const turkishMessages = {
  required: 'Bu alan zorunludur',
  email: 'Geçerli bir e-posta adresi giriniz',
  passwordMin: 'Şifre en az 8 karakter olmalıdır',
  passwordStrong: 'Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir',
  phone: 'Geçerli bir telefon numarası giriniz (örn: 5XXXXXXXXX)',
  firstName: 'Ad en az 2 karakter olmalıdır',
  lastName: 'Soyad en az 2 karakter olmalıdır',
  acceptTerms: 'Kullanım koşullarını kabul etmelisiniz',
}

// Login form schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, turkishMessages.required)
    .email(turkishMessages.email),
  password: z
    .string()
    .min(1, turkishMessages.required),
})

// Register form schema
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, turkishMessages.required)
    .email(turkishMessages.email),
  password: z
    .string()
    .min(8, turkishMessages.passwordMin)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, turkishMessages.passwordStrong),
  first_name: z
    .string()
    .min(2, turkishMessages.firstName)
    .max(50, 'Ad 50 karakterden az olmalıdır'),
  last_name: z
    .string()
    .min(2, turkishMessages.lastName)
    .max(50, 'Soyad 50 karakterden az olmalıdır'),
  phone: z
    .string()
    .optional()
    .refine(
      (phone) => {
        if (!phone) return true // Optional
        // Turkish phone number validation (5XXXXXXXXX format)
        return /^5\d{9}$/.test(phone.replace(/[^0-9]/g, ''))
      },
      turkishMessages.phone
    ),
  acceptTerms: z
    .boolean()
    .refine(val => val === true, turkishMessages.acceptTerms),
})

// Form types inferred from schemas
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>

// Password strength checker
export const checkPasswordStrength = (password: string): {
  score: number
  feedback: string[]
} => {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('En az 8 karakter')
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('En az bir küçük harf')
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('En az bir büyük harf')
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('En az bir rakam')
  }

  // Special character check (optional)
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1
  }

  return { score, feedback }
}

// Phone number formatter
export const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/[^0-9]/g, '')

  // Format as 5XX XXX XX XX
  if (digits.length <= 3) {
    return digits
  } else if (digits.length <= 6) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`
  } else if (digits.length <= 8) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  } else {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`
  }
}

// Email validation helper
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}