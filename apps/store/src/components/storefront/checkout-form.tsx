'use client'
import { useCheckoutForm } from '@/lib/form/checkout-form-provider'
import { Input } from 'tulumbak-ui'

export function CheckoutForm() {
  const { register, formState: { errors } } = useCheckoutForm()

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <div className="space-y-6">
        {/* Contact Information */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-tulumbak-slate mb-4">
            İletişim Bilgileri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                {...register('contact.email')}
                placeholder="Email"
                type="email"
              />
              {errors.contact?.email && (
                <p className="text-sm text-red-600 mt-1">{errors.contact.email.message}</p>
              )}
            </div>
            
            <div>
              <Input
                {...register('contact.phone')}
                placeholder="Telefon"
              />
              {errors.contact?.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.contact.phone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-tulumbak-slate mb-4">
            Teslimat Adresi
          </h3>
          <div className="space-y-4">
            <div>
              <Input
                {...register('address.street')}
                placeholder="Adres"
              />
              {errors.address?.street && (
                <p className="text-sm text-red-600 mt-1">{errors.address.street.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  {...register('address.city')}
                  placeholder="Şehir"
                />
                {errors.address?.city && (
                  <p className="text-sm text-red-600 mt-1">{errors.address.city.message}</p>
                )}
              </div>
              
              <div>
                <Input
                  {...register('address.postalCode')}
                  placeholder="Posta Kodu"
                />
                {errors.address?.postalCode && (
                  <p className="text-sm text-red-600 mt-1">{errors.address.postalCode.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Billing Information */}
        <div>
          <h3 className="text-lg font-semibold text-tulumbak-slate mb-4">
            Fatura Bilgileri
          </h3>
          <div className="space-y-4">
            <div>
              <Input
                {...register('billing.name')}
                placeholder="Fatura Adı"
              />
              {errors.billing?.name && (
                <p className="text-sm text-red-600 mt-1">{errors.billing.name.message}</p>
              )}
            </div>
            
            <div>
              <Input
                {...register('billing.taxId')}
                placeholder="Vergi Numarası (Opsiyonel)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}