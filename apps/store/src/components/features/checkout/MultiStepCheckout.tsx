'use client';

import React, { useState } from 'react';
import { ProgressBar } from './ProgressBar';
import { CheckoutForm } from './CheckoutForm';
import { OrderSummary } from './OrderSummary';
import { TermsModal } from './TermsModal';

interface MultiStepCheckoutProps {
  onComplete?: (data: any) => void;
  className?: string;
}

export function MultiStepCheckout({ onComplete, className = '' }: MultiStepCheckoutProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Shipping
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '35', // İzmir default
    deliveryNotes: '',
    // Step 2: Payment
    paymentMethod: 'paytr',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
  });

  const totalSteps = 3;

  const steps = [
    { id: 'shipping', title: 'Teslimat', description: 'Teslimat bilgilerinizi girin' },
    { id: 'payment', title: 'Ödeme', description: 'Ödeme yönteminizi seçin' },
    { id: 'review', title: 'İnceleme', description: 'Siparişinizi inceleyin' },
  ];

  const handleStepSubmit = (stepData: any) => {
    setFormData(prev => ({
      ...prev,
      ...stepData
    }));
    
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete checkout
      onComplete?.(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CheckoutForm
            onSubmit={handleStepSubmit}
          />
        );
      case 2:
        return <PaymentStep onSubmit={handleStepSubmit} onBack={handleBack} data={formData} />;
      case 3:
        return <ReviewStep onSubmit={handleStepSubmit} onBack={handleBack} data={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col gap-8 ${className}`}>
      {/* Progress Bar - Show on all steps */}
      <ProgressBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        steps={steps}
      />

      {/* Checkout Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">
        {/* Form */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {renderStep()}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}

// Payment Step Component
function PaymentStep({ onSubmit, onBack, data }: any) {
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // PayTR integration logic here
    onSubmit({ paymentMethod: 'paytr' });
  };

  return (
    <div className="bg-stitch-background-light rounded-xl border border-stitch-border-color shadow-sm">
      <h2 className="text-stitch-text-primary text-[22px] font-bold leading-tight tracking-[-0.015em] px-6 py-4 border-b border-stitch-border-color">
        Ödeme Bilgileri
      </h2>
      
      <div className="p-6">
        <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-6">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-stitch-primary/10 rounded-full mb-4">
              <svg className="w-8 h-8 text-stitch-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-stitch-text-primary mb-2">
              Güvenli Ödeme
            </h3>
            <p className="text-sm text-stitch-text-secondary mb-6">
              PayTR ile güvenli ödeme yapın
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 flex items-center justify-center rounded-lg h-12 border border-stitch-border-color text-stitch-text-primary gap-2 text-base font-bold leading-normal tracking-[0.015em] px-6 hover:bg-stitch-border-color/10 transition-colors"
            >
              Geri
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center overflow-hidden rounded-lg h-12 bg-stitch-primary text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] px-6 hover:bg-stitch-primary/90 transition-colors"
            >
              PayTR ile Öde
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Review Step Component
function ReviewStep({ onSubmit, onBack, data }: any) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showSalesContract, setShowSalesContract] = useState(false);
  const [showTermsOfUse, setShowTermsOfUse] = useState(false);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) return;
    onSubmit({ ...data, confirmed: true });
  };

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTermsAccepted(e.target.checked);
  };

  return (
    <>
      <div className="bg-stitch-background-light rounded-xl border border-stitch-border-color shadow-sm">
        <h2 className="text-stitch-text-primary text-[22px] font-bold leading-tight tracking-[-0.015em] px-6 py-4 border-b border-stitch-border-color">
          Sipariş İncelemesi
        </h2>
        
        <div className="p-6">
          <div className="space-y-6">
            {/* Shipping Information Review */}
            <div>
              <h3 className="font-semibold text-stitch-text-primary mb-3">Teslimat Bilgileri</h3>
              <div className="bg-stitch-border-color/20 rounded-lg p-4 space-y-2">
                <p className="text-sm"><span className="font-medium">Ad Soyad:</span> {data.fullName}</p>
                <p className="text-sm"><span className="font-medium">E-posta:</span> {data.email}</p>
                <p className="text-sm"><span className="font-medium">Telefon:</span> {data.phone}</p>
                <p className="text-sm"><span className="font-medium">Adres:</span> {data.address}</p>
                <p className="text-sm"><span className="font-medium">Şehir:</span> {data.city}</p>
                <p className="text-sm"><span className="font-medium">Posta Kodu:</span> {data.postalCode}</p>
                {data.deliveryNotes && (
                  <p className="text-sm"><span className="font-medium">Teslimat Notları:</span> {data.deliveryNotes}</p>
                )}
              </div>
            </div>

            {/* Payment Method Review */}
            <div>
              <h3 className="font-semibold text-stitch-text-primary mb-3">Ödeme Yöntemi</h3>
              <div className="bg-stitch-border-color/20 rounded-lg p-4">
                <p className="text-sm">PayTR - Güvenli Ödeme</p>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={handleTermsChange}
                className="mt-1 w-4 h-4 text-stitch-primary border-stitch-border-color rounded focus:ring-stitch-primary"
                required
              />
              <label htmlFor="terms" className="text-sm text-stitch-text-secondary">
                <button
                  type="button"
                  onClick={() => setShowSalesContract(true)}
                  className="text-stitch-primary hover:underline font-medium"
                >
                  Mesafeli Satış Sözleşmesi
                </button>
                {' '}ni ve{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsOfUse(true)}
                  className="text-stitch-primary hover:underline font-medium"
                >
                  Kullanım Koşulları
                </button>
                {' '}nı okudum ve kabul ediyorum.
              </label>
            </div>
          </div>

          <form onSubmit={handleReviewSubmit} className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 flex items-center justify-center rounded-lg h-12 border border-stitch-border-color text-stitch-text-primary gap-2 text-base font-bold leading-normal tracking-[0.015em] px-6 hover:bg-stitch-border-color/10 transition-colors"
            >
              Geri
            </button>
            <button
              type="submit"
              disabled={!termsAccepted}
              className={`flex-1 flex items-center justify-center overflow-hidden rounded-lg h-12 gap-2 text-base font-bold leading-normal tracking-[0.015em] px-6 transition-colors ${
                termsAccepted
                  ? 'bg-stitch-primary text-white hover:bg-stitch-primary/90'
                  : 'bg-stitch-border-color text-stitch-text-secondary cursor-not-allowed'
              }`}
            >
              Siparişi Tamamla
            </button>
          </form>
        </div>
      </div>

      {/* Sales Contract Modal */}
      <TermsModal
        isOpen={showSalesContract}
        onClose={() => setShowSalesContract(false)}
        title="Mesafeli Satış Sözleşmesi"
      >
        <div className="space-y-4">
          <h4 className="font-semibold text-stitch-text-primary">1. TARAFLAR</h4>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          
          <h4 className="font-semibold text-stitch-text-primary">2. KONU</h4>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          
          <h4 className="font-semibold text-stitch-text-primary">3. TESLİMAT ŞARTLARI</h4>
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </p>
          
          <h4 className="font-semibold text-stitch-text-primary">4. İADE KOŞULLARI</h4>
          <p>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
          </p>
          
          <h4 className="font-semibold text-stitch-text-primary">5. CAYMA HAKKI</h4>
          <p>
            At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.
          </p>
        </div>
      </TermsModal>

      {/* Terms of Use Modal */}
      <TermsModal
        isOpen={showTermsOfUse}
        onClose={() => setShowTermsOfUse(false)}
        title="Kullanım Koşulları"
      >
        <div className="space-y-4">
          <h4 className="font-semibold text-stitch-text-primary">1. GENEL HÜKÜMLER</h4>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
          
          <h4 className="font-semibold text-stitch-text-primary">2. KULLANICI SORUMLULUKLARI</h4>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.
          </p>
          
          <h4 className="font-semibold text-stitch-text-primary">3. GİZLİLİK POLİTİKASI</h4>
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto.
          </p>
          
          <h4 className="font-semibold text-stitch-text-primary">4. FİKRİ MÜLKİYET HAKLARI</h4>
          <p>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
          </p>
          
          <h4 className="font-semibold text-stitch-text-primary">5. SÖZLEŞMENİN DEĞİŞTİRİLMESİ</h4>
          <p>
            At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint.
          </p>
        </div>
      </TermsModal>
    </>
  );
}