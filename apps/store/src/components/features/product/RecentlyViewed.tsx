'use client';

import React from 'react';
import Image from 'next/image';
import { RecentlyViewedProduct } from '@/types/product';
import { formatTL } from '@/lib/format';
import Link from 'next/link';

interface RecentlyViewedProps {
  products: RecentlyViewedProduct[];
  className?: string;
}

export function RecentlyViewed({ products, className = '' }: RecentlyViewedProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = 300; // Scroll amount in pixels
    const currentScroll = scrollContainerRef.current.scrollLeft;
    
    if (direction === 'left') {
      scrollContainerRef.current.scrollTo({
        left: Math.max(0, currentScroll - scrollAmount),
        behavior: 'smooth'
      });
    } else {
      scrollContainerRef.current.scrollTo({
        left: currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={`mt-16 pt-12 border-t border-product-accent/20 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-product-display font-bold text-product-text-light">
          Son Görüntülenen Ürünler
        </h2>
        
        {/* Navigation Buttons - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-full border border-product-accent/30 flex items-center justify-center text-product-subtext-light hover:bg-product-accent/10 transition-colors"
            aria-label="Önceki ürünler"
          >
            <span className="material-symbols-outlined text-xl">
              arrow_back
            </span>
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-full border border-product-accent/30 flex items-center justify-center text-product-subtext-light hover:bg-product-accent/10 transition-colors"
            aria-label="Sonraki ürünler"
          >
            <span className="material-symbols-outlined text-xl">
              arrow_forward
            </span>
          </button>
        </div>
      </div>

      {/* Product Carousel */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide gap-8 pb-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/urun/${product.slug}`}
              className="flex-shrink-0 w-64 flex flex-col gap-4 group"
            >
              {/* Product Image */}
              <div className="relative overflow-hidden rounded-lg aspect-square">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>

              {/* Product Info */}
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-product-text-light group-hover:text-product-primary transition-colors line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm text-product-subtext-light">
                  {product.category.name}
                </p>
                <p className="text-lg font-bold text-product-warm-button">
                  {formatTL(product.price)}
                </p>
              </div>

              {/* Quick Add Button */}
              <button className="w-full flex items-center justify-center rounded-full h-10 bg-product-accent/20 text-product-text-light hover:bg-product-warm-button hover:text-white transition-colors text-sm font-medium">
                Hızlı Gör
              </button>
            </Link>
          ))}
        </div>

        {/* Mobile Navigation Dots */}
        <div className="flex justify-center gap-2 mt-4 md:hidden">
          {products.map((_, index) => (
            <button
              key={index}
              className="w-2 h-2 rounded-full bg-product-accent/30"
              aria-label={`Ürün ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* View All Button */}
      <div className="flex justify-center mt-8">
        <Link
          href="/tum-urunler"
          className="flex items-center justify-center rounded-full h-12 px-8 border border-product-accent/30 text-product-text-light hover:bg-product-accent/10 transition-colors font-medium"
        >
          Tüm Ürünleri Gör
        </Link>
      </div>
    </div>
  );
}

// Add custom scrollbar hide styles
const style = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('recently-viewed-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'recently-viewed-styles';
  styleElement.innerHTML = style;
  document.head.appendChild(styleElement);
}