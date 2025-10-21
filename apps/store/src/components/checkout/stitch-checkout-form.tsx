'use client';

import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
import { StitchProgressBar } from './stitch-progress-bar';
import { StitchInput, StitchFormRow, StitchFormFullRow } from './stitch-form-inputs';

interface StitchCheckoutFormProps {
  onSubmit?: (data: FormData) => void;
  className?: string;
}

export function StitchCheckoutForm({ onSubmit, className = '' }: StitchCheckoutFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const currentStep = 1;
  const totalSteps = 3;

  const steps = [
    { id: 'shipping', title: 'Teslimat', description: 'Teslimat bilgilerinizi girin' },
    { id: 'payment', title: 'Ödeme', description: 'Ödeme yönteminizi seçin' },
    { id: 'review', title: 'İnceleme', description: 'Siparişinizi inceleyin' },
  ];

  const countryOptions = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'TR', label: 'Turkey' },
    { value: 'GB', label: 'United Kingdom' },
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
      {/* Progress Bar */}
      <StitchProgressBar 
        currentStep={currentStep} 
        totalSteps={totalSteps} 
        steps={steps} 
      />

      {/* Shipping Information Card */}
      <div className="bg-stitch-background-light rounded-xl border border-stitch-border-color shadow-sm">
        <h2 className="text-stitch-text-primary text-[22px] font-bold leading-tight tracking-[-0.015em] px-6 py-4 border-b border-stitch-border-color">
          Shipping Information
        </h2>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <StitchFormFullRow>
            <StitchInput
              label="Ad Soyad"
              name="fullName"
              placeholder="Adınızı ve soyadınızı girin"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </StitchFormFullRow>

          {/* Email Address */}
          <StitchFormFullRow>
            <StitchInput
              label="E-posta Adresi"
              name="email"
              type="email"
              placeholder="E-posta adresinizi girin"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </StitchFormFullRow>

          {/* Address */}
          <StitchFormFullRow>
            <StitchInput
              label="Adres"
              name="address"
              placeholder="Cadde, sokak ve kapı numaranızı girin"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </StitchFormFullRow>

          {/* City and Postal Code */}
          <StitchFormRow>
            <StitchInput
              label="City"
              name="city"
              placeholder="Enter your city"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
            
            <StitchInput
              label="Postal Code"
              name="postalCode"
              placeholder="Enter your postal code"
              value={formData.postalCode}
              onChange={handleInputChange}
              required
            />
          </StitchFormRow>

          {/* Country */}
          <StitchFormFullRow>
            <StitchInput
              label="Ülke"
              name="country"
              type="select"
              options={countryOptions}
              value={formData.country}
              onChange={handleInputChange}
              required
            />
          </StitchFormFullRow>
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