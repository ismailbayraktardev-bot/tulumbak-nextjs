import { CheckoutFormProvider } from '@/lib/form/checkout-form-provider'
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
    <CheckoutFormProvider>
      <div className="min-h-screen bg-white">
        <Navbar />
        
        <main>
          {/* Mobile-first: Page Header */}
          <div className="bg-tulumbak-beige py-4 sm:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-tulumbak-slate">
                Siparişi Tamamla
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                Siparişinizi tamamlamak için aşağıdaki adımları takip edin
              </p>
            </div>
          </div>

          {/* Mobile-first: Checkout Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Mobile-first: Checkout Steps */}
              <div className="lg:col-span-2">
                <CheckoutSteps steps={steps} />
                 
                <div className="mt-4 sm:mt-6 lg:mt-8">
                  <CheckoutForm />
                </div>
              </div>

              {/* Mobile-first: Order Summary */}
              <div className="lg:col-span-1">
                <CheckoutSummary />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </CheckoutFormProvider>
  )
}
