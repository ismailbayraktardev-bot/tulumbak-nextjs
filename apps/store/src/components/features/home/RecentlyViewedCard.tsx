'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';

interface RecentlyViewedCardProps {
  product: Product;
  className?: string;
}

export function RecentlyViewedCard({ product, className = '' }: RecentlyViewedCardProps) {
  return (
    <Link
      href={`/urun/${product.slug}`}
      className={`flex flex-col gap-2 rounded-xl bg-stitch-background-light shadow-[0_4px_12px_rgba(0,0,0,0.05)] min-w-48 p-3 hover:shadow-lg transition-shadow ${className}`}
    >
      {/* Product Image */}
      <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg relative overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Product Name */}
      <p className="text-stitch-text-primary text-base font-semibold leading-normal truncate">
        {product.name}
      </p>
    </Link>
  );
}