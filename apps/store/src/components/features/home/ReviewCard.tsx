'use client';

import React from 'react';
import { Review } from '@/types/home';

interface ReviewCardProps {
  review: Review;
  className?: string;
}

export function ReviewCard({ review, className = '' }: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span 
        key={i} 
        className="material-symbols-outlined text-lg"
      >
        {i < rating ? 'star' : (i === Math.floor(rating) && rating % 1 !== 0 ? 'star_half' : 'star_border')}
      </span>
    ));
  };

  return (
    <div className={`flex flex-col gap-4 rounded-xl bg-stitch-background-light shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-6 ${className}`}>
      {/* Rating */}
      <div className="flex items-center gap-2 text-stitch-primary">
        {renderStars(review.rating)}
      </div>
      
      {/* Review Content */}
      <p className="text-stitch-text-primary text-base font-normal leading-normal">
        "{review.content}"
      </p>
      
      {/* Reviewer */}
      <p className="text-stitch-text-secondary text-sm font-bold leading-normal">
        - {review.reviewer.name}
      </p>
    </div>
  );
}