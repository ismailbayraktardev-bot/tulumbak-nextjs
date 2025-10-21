'use client';

import React, { useState } from 'react';
import { Product, WeightOption } from '@/types/product';
import { formatTL } from '@/lib/format';

interface ProductInfoProps {
  product: Product;
  onAddToCart: (quantity: number, weightId: string) => void;
  className?: string;
}

export function ProductInfo({ product, onAddToCart, className = '' }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState(product.weightOptions[0]?.id || '');

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else {
      setQuantity(prev => Math.max(1, prev - 1));
    }
  };

  const handleWeightChange = (weightId: string) => {
    setSelectedWeight(weightId);
  };

  const handleAddToCart = () => {
    if (selectedWeight) {
      onAddToCart(quantity, selectedWeight);
    }
  };

  const selectedWeightOption = product.weightOptions.find(option => option.id === selectedWeight);
  const currentPrice = selectedWeightOption?.price || product.price;

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Product Title */}
      <h1 className="text-4xl lg:text-5xl font-product-display font-bold text-product-text-light">
        {product.name}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex text-product-accent">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="material-symbols-outlined text-lg">
              {i < Math.floor(product.rating) ? 'star' : 'star_border'}
            </span>
          ))}
        </div>
        <span className="text-sm text-product-subtext-light">({product.reviewCount} Yorum)</span>
      </div>

      {/* Description */}
      <p className="text-product-subtext-light leading-relaxed">
        {product.description}
      </p>

      {/* Price */}
      <div className="flex items-baseline gap-4">
        <span className="text-4xl font-bold text-product-warm-button">
          {formatTL(currentPrice)}
        </span>
        {product.originalPrice && (
          <span className="text-lg text-product-subtext-light line-through">
            {formatTL(product.originalPrice)}
          </span>
        )}
      </div>

      {/* Quantity and Weight Selection */}
      <div className="space-y-4 pt-4">
        {/* Quantity Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-product-text-light" htmlFor="quantity">
            Kaç kutu almak istersiniz?
          </label>
          <div className="flex items-center border border-product-accent/30 rounded-full w-min">
            <button
              type="button"
              onClick={() => handleQuantityChange('decrease')}
              className="px-3 py-2 text-product-subtext-light hover:text-product-text-light transition-colors"
            >
              -
            </button>
            <input
              id="quantity"
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 text-center border-0 bg-transparent focus:ring-0 text-product-text-light"
              readOnly
            />
            <button
              type="button"
              onClick={() => handleQuantityChange('increase')}
              className="px-3 py-2 text-product-subtext-light hover:text-product-text-light transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Weight Selector */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-product-text-light" htmlFor="weight">
            Kaç Kilogram Almak İstersiniz?
          </label>
          <select
            id="weight"
            value={selectedWeight}
            onChange={(e) => handleWeightChange(e.target.value)}
            className="w-full h-12 px-4 rounded-lg border border-product-accent/30 bg-product-background-light focus:border-product-warm-button focus:ring-product-warm-button text-sm text-product-text-light"
          >
            {product.weightOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={!selectedWeight || !product.inStock}
        className={`w-full flex items-center justify-center rounded-full h-14 px-8 text-lg font-bold transition-colors ${
          selectedWeight && product.inStock
            ? 'bg-product-warm-button text-white hover:bg-opacity-90'
            : 'bg-product-accent/20 text-product-subtext-light cursor-not-allowed'
        }`}
      >
        {product.inStock ? 'Sepete Ekle' : 'Stokta Yok'}
      </button>

      {/* Delivery Options */}
      <div className="pt-6 border-t border-product-accent/20 mt-6">
        <h3 className="text-lg font-bold mb-2 text-product-text-light">Teslimat seçenekleri</h3>
        <div className="space-y-2 text-sm text-product-subtext-light">
          <p>
            <span className="font-semibold">Standart Kargo:</span> {product.deliveryInfo.standardDelivery}
          </p>
          <p>
            <span className="font-semibold">Hızlı Kargo:</span> {product.deliveryInfo.expressDelivery}
          </p>
        </div>
      </div>

      {/* Share Section */}
      <div className="flex items-center gap-4 pt-4 border-t border-product-accent/20">
        <p className="text-sm font-medium text-product-text-light">Paylaş:</p>
        <div className="flex gap-2">
          <a
            href="#"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-product-accent/30 text-product-subtext-light hover:bg-product-accent/10 transition-colors"
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path clipRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fillRule="evenodd"></path>
            </svg>
          </a>
          <a
            href="#"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-product-accent/30 text-product-subtext-light hover:bg-product-accent/10 transition-colors"
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
            </svg>
          </a>
          <a
            href="#"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-product-accent/30 text-product-subtext-light hover:bg-product-accent/10 transition-colors"
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path clipRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.792 2.013 10.146 2 12.315 2zM8.447 12a3.868 3.868 0 107.736 0 3.868 3.868 0 00-7.736 0zM12 14.188a2.188 2.188 0 110-4.375 2.188 2.188 0 010 4.375zM17.653 6.55a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z" fillRule="evenodd"></path>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}