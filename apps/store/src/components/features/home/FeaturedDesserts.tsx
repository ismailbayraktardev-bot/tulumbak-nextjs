'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Product } from '@/types/product';
import { FeaturedProductCard } from './FeaturedProductCard';

interface FeaturedDessertsProps {
  products: Product[];
  title?: string;
  className?: string;
}

export function FeaturedDesserts({ products, title = "Öne Çıkan Tatlılar", className = '' }: FeaturedDessertsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      
      if (direction === 'left') {
        scrollContainerRef.current.scrollBy({
          left: -scrollAmount,
          behavior: 'smooth'
        });
      } else {
        scrollContainerRef.current.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // Check scroll buttons on mount and resize
      checkScrollButtons();
      window.addEventListener('resize', checkScrollButtons);
      
      // Check scroll buttons on scroll
      container.addEventListener('scroll', checkScrollButtons);
      
      return () => {
        window.removeEventListener('resize', checkScrollButtons);
        container.removeEventListener('scroll', checkScrollButtons);
      };
    }
  }, []);

  return (
    <section className={`py-10 ${className}`}>
      {/* Section Title */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-6">
        <h2 className="text-stitch-text-primary text-3xl font-bold leading-tight tracking-[-0.015em] text-center">
          {title}
        </h2>
      </div>

      {/* Navigation Buttons - Hidden on mobile */}
      <div className="hidden md:flex justify-end items-center gap-2 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-4">
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`w-10 h-10 rounded-full border border-stitch-text-secondary/30 flex items-center justify-center text-stitch-text-secondary transition-colors ${
            canScrollLeft 
              ? 'hover:bg-stitch-text-secondary/10 cursor-pointer' 
              : 'opacity-50 cursor-not-allowed'
          }`}
          aria-label="Önceki ürünler"
        >
          <span className="material-symbols-outlined text-xl">
            arrow_back
          </span>
        </button>
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={`w-10 h-10 rounded-full border border-stitch-text-secondary/30 flex items-center justify-center text-stitch-text-secondary transition-colors ${
            canScrollRight 
              ? 'hover:bg-stitch-text-secondary/10 cursor-pointer' 
              : 'opacity-50 cursor-not-allowed'
          }`}
          aria-label="Sonraki ürünler"
        >
          <span className="material-symbols-outlined text-xl">
            arrow_forward
          </span>
        </button>
      </div>

      {/* Products Carousel */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-5 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex items-stretch p-4 sm:p-6 lg:p-8 gap-4 max-w-7xl mx-auto">
          {products.map((product) => (
            <div key={product.id} className="flex-none snap-start">
              <FeaturedProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}