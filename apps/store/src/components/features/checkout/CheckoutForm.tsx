'use client';

import React, { useState } from 'react';
import { ProgressBar } from './ProgressBar';
import { Input, FormRow, FormFullRow } from './FormInputs';

interface CheckoutFormProps {
  onSubmit?: (data: FormData) => void;
  className?: string;
}

export function CheckoutForm({ onSubmit, className = '' }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '35', // İzmir default
    deliveryNotes: '',
  });

  const currentStep = 1;
  const totalSteps = 3;

  const steps = [
    { id: 'shipping', title: 'Teslimat', description: 'Teslimat bilgilerinizi girin' },
    { id: 'payment', title: 'Ödeme', description: 'Ödeme yönteminizi seçin' },
    { id: 'review', title: 'İnceleme', description: 'Siparişinizi inceleyin' },
  ];

  const cityOptions = [
    { value: '35', label: 'İzmir' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-8 ${className}`}>
      {/* Shipping Information Card */}
      <div className="bg-stitch-background-light rounded-xl border border-stitch-border-color shadow-sm">
        <h2 className="text-stitch-text-primary text-[22px] font-bold leading-tight tracking-[-0.015em] px-6 py-4 border-b border-stitch-border-color">
          Teslimat Bilgileri
        </h2>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <FormFullRow>
            <Input
              label="Ad Soyad"
              name="fullName"
              placeholder="Adınızı ve soyadınızı girin"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </FormFullRow>

          {/* Email Address */}
          <FormFullRow>
            <Input
              label="E-posta Adresi"
              name="email"
              type="email"
              placeholder="E-posta adresinizi girin"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </FormFullRow>

          {/* Phone Number */}
          <FormFullRow>
            <Input
              label="Telefon Numarası"
              name="phone"
              type="tel"
              placeholder="5XX XXX XX XX"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </FormFullRow>

          {/* Address */}
          <FormFullRow>
            <Input
              label="Teslimat Adresi"
              name="address"
              placeholder="Cadde, sokak, kapı numarası ve daire bilgisi"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </FormFullRow>

          {/* City and Postal Code */}
          <FormRow>
            <Input
              label="Şehir"
              name="city"
              type="select"
              options={cityOptions}
              value={formData.city}
              onChange={handleInputChange}
              required
            />
            
          </FormRow>

          {/* Delivery Notes */}
          <FormFullRow>
            <Input
              label="Teslimat Notları (Opsiyonel)"
              name="deliveryNotes"
              placeholder="Kuryenin dikkat etmesi gereken özel notlar..."
              value={formData.deliveryNotes}
              onChange={handleInputChange}
            />
          </FormFullRow>
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          className="flex items-center justify-center overflow-hidden rounded-lg h-12 bg-stitch-primary text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-[180px] px-6 hover:bg-stitch-primary/90 transition-colors"
        >
          Ödemeye Devam Et
        </button>
      </div>
    </form>
  );
}