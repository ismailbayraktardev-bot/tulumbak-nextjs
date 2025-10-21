'use client';

import React, { useState } from 'react';
import { ProductTabs as ProductTabsType } from '@/types/product';

interface ProductTabsProps {
  tabs: ProductTabsType;
  reviews: React.ReactNode;
  className?: string;
}

export function ProductTabs({ tabs, reviews, className = '' }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState('description');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className={`mt-16 ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-product-accent/20">
        <nav aria-label="Tabs" className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => handleTabChange('description')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'description'
                ? 'border-product-warm-button text-product-warm-button'
                : 'border-transparent text-product-subtext-light hover:text-product-text-light hover:border-product-accent/30'
            }`}
          >
            Açıklama
          </button>
          <button
            onClick={() => handleTabChange('ingredients')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'ingredients'
                ? 'border-product-warm-button text-product-warm-button'
                : 'border-transparent text-product-subtext-light hover:text-product-text-light hover:border-product-accent/30'
            }`}
          >
            İçindekiler & Alerjenler
          </button>
          <button
            onClick={() => handleTabChange('nutritional')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'nutritional'
                ? 'border-product-warm-button text-product-warm-button'
                : 'border-transparent text-product-subtext-light hover:text-product-text-light hover:border-product-accent/30'
            }`}
          >
            Besinsel Bilgiler
          </button>
          <button
            onClick={() => handleTabChange('reviews')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'reviews'
                ? 'border-product-warm-button text-product-warm-button'
                : 'border-transparent text-product-subtext-light hover:text-product-text-light hover:border-product-accent/30'
            }`}
          >
            Yorumlar
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-8">
        {activeTab === 'description' && (
          <div className="prose prose-sm max-w-none text-product-subtext-light">
            <p>{tabs.description}</p>
          </div>
        )}

        {activeTab === 'ingredients' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-product-text-light mb-3">İçindekiler</h3>
              <div className="flex flex-wrap gap-2">
                {tabs.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-product-accent/20 text-product-text-light rounded-full text-sm"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>

            {tabs.allergens.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-product-text-light mb-3">Alerjen Uyarısı</h3>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <span className="font-semibold">Alerjenler:</span> {tabs.allergens.join(', ')}
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    Bu ürün alerjen reaksiyonlara neden olabilir. Lütfen içerik listesini dikkatlice okuyun.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'nutritional' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-product-text-light">Besinsel Bilgiler</h3>
            <div className="bg-product-secondary rounded-lg p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-product-primary">{tabs.nutritionalInfo.calories}</p>
                  <p className="text-sm text-product-subtext-light">Kalori</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-product-primary">{tabs.nutritionalInfo.protein}g</p>
                  <p className="text-sm text-product-subtext-light">Protein</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-product-primary">{tabs.nutritionalInfo.carbs}g</p>
                  <p className="text-sm text-product-subtext-light">Karbonhidrat</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-product-primary">{tabs.nutritionalInfo.fat}g</p>
                  <p className="text-sm text-product-subtext-light">Yağ</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-product-accent/20">
                <p className="text-xs text-product-subtext-light text-center">
                  *Değerler {tabs.nutritionalInfo.serving} porsiyon içindir
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            {reviews}
          </div>
        )}
      </div>
    </div>
  );
}