'use client'
import { createContext, useContext } from 'react'
import { UseFormReturn, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Checkout form schema
const checkoutSchema = z.object({
  contact: z.object({
    email: z.string().email('Geçerli bir email girin'),
    phone: z.string().min(10, 'Telefon numarası en az 10 karakter olmalı'),
  }),
  address: z.object({
    street: z.string().min(5, 'Adres en az 5 karakter olmalı'),
    city: z.string().min(2, 'Şehir gerekli'),
    postalCode: z.string().min(5, 'Posta kodu gerekli'),
  }),
  billing: z.object({
    type: z.enum(['individual', 'corporate']),
    name: z.string().min(2, 'İsim gerekli'),
    taxId: z.string().optional(),
  }),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

const CheckoutFormContext = createContext<UseFormReturn<CheckoutFormData> | null>(null)

export function CheckoutFormProvider({ children }: { children: React.ReactNode }) {
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onBlur',
  })

  return (
    <CheckoutFormContext.Provider value={form}>
      {children}
    </CheckoutFormContext.Provider>
  )
}

export function useCheckoutForm() {
  const context = useContext(CheckoutFormContext)
  if (!context) throw new Error('useCheckoutForm must be used within CheckoutFormProvider')
  return context
}
