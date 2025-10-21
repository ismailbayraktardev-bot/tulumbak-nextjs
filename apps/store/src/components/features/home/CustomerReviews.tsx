'use client';

import React from 'react';
import { Review } from '@/types/home';
import { ReviewCard } from './ReviewCard';

interface CustomerReviewsProps {
  reviews: Review[];
  title?: string;
  className?: string;
}

export function CustomerReviews({ reviews, title = "Müşteriler Ne Diyor", className = '' }: CustomerReviewsProps) {
  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className={`py-10 ${className}`}>
      {/* Section Title */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-6">
        <h2 className="text-stitch-text-primary text-3xl font-bold leading-tight tracking-[-0.015em] text-center">
          {title}
        </h2>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}