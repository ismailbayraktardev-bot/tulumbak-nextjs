import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { CheckoutSteps } from '@/components/storefront/checkout-steps'
import { CheckoutForm } from '@/components/storefront/checkout-form'
import { CheckoutSummary } from '@/components/storefront/checkout-summary'

export default function CheckoutPage() {
  const steps = [
    {
      id: 'contact',
      title: 'İletişim Bilgileri',
      description: 'Ad, soyad ve iletişim bilgilerinizi girin',
      completed: false,
      current: true
    },
    {
      id: 'address',
      title: 'Teslimat Adresi',
      description: 'Ürünlerin teslim edileceği adresi belirleyin',
      completed: false,
      current: false
    },
    {
      id: 'delivery',
      title: 'Teslimat Zamanı',
      description: 'Ne zaman teslim almak istediğinizi seçin',
      completed: false,
      current: false
    },
    {
      id: 'billing',
      title: 'Fatura Bilgileri',
      description: 'Fatura adresi ve vergi bilgileri',
      completed: false,
      current: false
    },
    {
      id: 'payment',
      title: 'Ödeme',
      description: 'Ödeme yöntemi seçin ve siparişi tamamlayın',
      completed: false,
      current: false
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <div className="bg-tulumbak-beige py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-serif font-bold text-tulumbak-slate">
              Siparişi Tamamla
            </h1>
            <p className="text-gray-600 mt-2">
              Siparişinizi tamamlamak için aşağıdaki adımları takip edin
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Steps */}
            <div className="lg:col-span-2">
              <CheckoutSteps steps={steps} />
              
              <div className="mt-8">
                <CheckoutForm />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <CheckoutSummary />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
