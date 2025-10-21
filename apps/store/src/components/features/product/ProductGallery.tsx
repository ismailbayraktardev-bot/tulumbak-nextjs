'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export function ProductGallery({ images, alt, className = '' }: ProductGalleryProps) {
  const [mainImage, setMainImage] = useState(0);

  const handleThumbnailClick = (index: number) => {
    setMainImage(index);
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Main Image */}
      <div className="zoom-container rounded-xl overflow-hidden border border-product-accent/20">
        <div className="relative w-full aspect-square">
          <Image
            src={images[mainImage]}
            alt={alt}
            fill
            className="object-cover transition-transform duration-300 hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </div>
      </div>

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-4 gap-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => handleThumbnailClick(index)}
            className={`relative w-full aspect-square rounded-lg border-2 overflow-hidden transition-all ${
              mainImage === index
                ? 'border-product-warm-button'
                : 'border-product-accent/20 hover:border-product-warm-button'
            }`}
          >
            <Image
              src={image}
              alt={`${alt} - Thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 25vw, 10vw"
            />
          </button>
        ))}
      </div>
    </div>
  );
}