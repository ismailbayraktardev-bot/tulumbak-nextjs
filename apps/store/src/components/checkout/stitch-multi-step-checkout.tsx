'use client';

import React, { useState } from 'react';
import { StitchProgressBar } from './stitch-progress-bar';
import { StitchCheckoutForm } from './stitch-checkout-form';
import { StitchOrderSummary } from './stitch-order-summary';

interface StitchMultiStepCheckoutProps {
  onComplete?: (data: any) => void;
  className?: string;
}

export function StitchMultiStepCheckout({ onComplete, className = '' }: StitchMultiStepCheckoutProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Shipping
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
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
          <StitchCheckoutForm
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
      {/* Progress Bar */}
      <StitchProgressBar 
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
          <StitchOrderSummary />
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
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...data, confirmed: true });
  };

  return (
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
              <p className="text-sm"><span className="font-medium">Adres:</span> {data.address}</p>
              <p className="text-sm"><span className="font-medium">Şehir:</span> {data.city}</p>
              <p className="text-sm"><span className="font-medium">Posta Kodu:</span> {data.postalCode}</p>
              <p className="text-sm"><span className="font-medium">Ülke:</span> {data.country}</p>
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
              className="mt-1 w-4 h-4 text-stitch-primary border-stitch-border-color rounded focus:ring-stitch-primary"
              required
            />
            <label htmlFor="terms" className="text-sm text-stitch-text-secondary">
              <a href="#" className="text-stitch-primary hover:underline">Mesafeli Satış Sözleşmesi</a>'ni ve 
              <a href="#" className="text-stitch-primary hover:underline">Kullanım Koşulları</a>'nı okudum ve kabul ediyorum.
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
            className="flex-1 flex items-center justify-center overflow-hidden rounded-lg h-12 bg-stitch-primary text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] px-6 hover:bg-stitch-primary/90 transition-colors"
          >
            Siparişi Tamamla
          </button>
        </form>
      </div>
    </div>
  );
}