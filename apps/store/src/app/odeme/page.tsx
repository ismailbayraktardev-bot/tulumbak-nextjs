'use client'

import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { MultiStepCheckout } from '@/components/features/checkout/MultiStepCheckout'

export default function CheckoutPage() {
  const handleCheckoutComplete = (data: any) => {
    // Handle complete checkout
    console.log('Checkout completed:', data);
    // Navigate to success page or PayTR
    // window.location.href = '/api/v1/payments/paytr/init';
  };

  return (
    <div className="min-h-screen bg-stitch-background-light">
      <Navbar />
      
      <main className="layout-container flex h-full grow flex-col px-4 md:px-10 lg:px-20 py-10">
        <div className="layout-content-container flex flex-col max-w-7xl flex-1 self-center">
          <div className="flex flex-col gap-8">
            {/* Page Header */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-stitch-text-primary text-4xl font-black leading-tight tracking-[-0.033em] min-w-72 font-display">
                Ödeme
              </p>
            </div>

            {/* Checkout Content */}
            <MultiStepCheckout
              onComplete={handleCheckoutComplete}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
