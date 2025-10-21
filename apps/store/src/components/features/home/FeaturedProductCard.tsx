'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { formatTL } from '@/lib/format';

interface FeaturedProductCardProps {
  product: Product;
  onProductClick?: (product: Product) => void;
  className?: string;
}

export function FeaturedProductCard({ product, onProductClick, className = '' }: FeaturedProductCardProps) {
  const handleClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  return (
    <div className={`flex h-full flex-1 flex-col gap-4 rounded-xl bg-stitch-background-light shadow-[0_4px_12px_rgba(0,0,0,0.05)] min-w-64 ${className}`}>
      {/* Product Image */}
      <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-t-xl flex flex-col relative overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1 justify-between p-4 pt-0 gap-4">
        <div>
          {/* Product Name */}
          <p className="text-stitch-text-primary text-lg font-bold leading-normal">
            {product.name}
          </p>
          
          {/* Product Description */}
          <p className="text-stitch-text-secondary text-sm font-normal leading-normal">
            {product.description}
          </p>
          
          {/* Product Price */}
          <p className="text-stitch-primary font-bold mt-2">
            {formatTL(product.price)}
          </p>
        </div>

        {/* View Product Button */}
        <Link
          href={`/urun/${product.slug}`}
          onClick={handleClick}
          className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#f3ede7] text-stitch-text-primary text-sm font-bold leading-normal tracking-[0.015em] hover:bg-stitch-primary/20 transition-colors"
        >
          <span className="truncate">Ürünü Görüntüle</span>
        </Link>
      </div>
    </div>
  );
}