'use client';

import React, { useState } from 'react';
import { Review, ReviewForm } from '@/types/product';
import { formatRelativeTime } from '@/lib/format';

interface ReviewSectionProps {
  reviews: Review[];
  onReviewSubmit: (review: ReviewForm) => void;
  className?: string;
}

export function ReviewSection({ reviews, onReviewSubmit, className = '' }: ReviewSectionProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formData, setFormData] = useState<ReviewForm>({
    rating: 0,
    title: '',
    content: '',
    reviewerName: ''
  });

  const handleRatingClick = (value: number) => {
    setRating(value);
    setFormData(prev => ({ ...prev, rating: value }));
  };

  const handleInputChange = (field: keyof ReviewForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rating === 0) return;
    
    onReviewSubmit(formData);
    // Reset form
    setFormData({
      rating: 0,
      title: '',
      content: '',
      reviewerName: ''
    });
    setRating(0);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 ${className}`}>
      {/* Customer Reviews */}
      <div className="flex flex-col gap-6">
        <h3 className="text-2xl font-product-display font-bold text-product-text-light">
          Müşteri Yorumları
        </h3>
        
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="flex flex-col gap-4 border-b border-product-accent/20 pb-6">
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex text-product-accent">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-base">
                      {i < review.rating ? 'star' : 'star_border'}
                    </span>
                  ))}
                </div>
                {review.verified && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Doğrulanmış Alıcı
                  </span>
                )}
              </div>
              
              {/* Title */}
              <p className="font-bold text-product-text-light">{review.title}</p>
              
              {/* Content */}
              <p className="text-product-subtext-light text-sm">{review.content}</p>
              
              {/* Reviewer and Date */}
              <p className="text-xs text-product-subtext-light">
                {review.reviewer.name} tarafından {formatRelativeTime(review.date)} tarihinde değerlendirildi
              </p>
              
              {/* Helpful */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-product-subtext-light">
                  Bu yorum {review.helpful} kişiye yardım etti
                </span>
                <button className="text-xs text-product-warm-button hover:underline">
                  Yardımcı oldu mu?
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Write a Review */}
      <div className="flex flex-col gap-6 p-8 bg-product-secondary rounded-xl border border-product-accent/20">
        <h3 className="text-2xl font-product-display font-bold text-product-text-light">
          Yorum Yazın
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-product-text-light mb-2">
              Puanınız
            </label>
            <div className="flex items-center gap-1 text-product-accent">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleRatingClick(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <span 
                    className={`material-symbols-outlined text-2xl ${
                      value <= (hoveredRating || rating) ? '' : 'unfilled'
                    }`}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label className="block text-sm font-medium text-product-text-light mb-1" htmlFor="review_title">
              Yorum Başlığı
            </label>
            <input
              id="review_title"
              type="text"
              placeholder="örn, Harika bir ürün!"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full rounded-lg border-product-accent/30 bg-product-background-light focus:border-product-warm-button focus:ring-product-warm-button text-sm text-product-text-light"
              required
            />
          </div>

          {/* Review Content */}
          <div>
            <label className="block text-sm font-medium text-product-text-light mb-1" htmlFor="review_body">
              Yorumunuz
            </label>
            <textarea
              id="review_body"
              placeholder="Düşüncelerinizi paylaşın..."
              rows={4}
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              className="w-full rounded-lg border-product-accent/30 bg-product-background-light focus:border-product-warm-button focus:ring-product-warm-button text-sm text-product-text-light"
              required
            />
          </div>

          {/* Reviewer Name */}
          <div>
            <label className="block text-sm font-medium text-product-text-light mb-1" htmlFor="reviewer_name">
              Adınız
            </label>
            <input
              id="reviewer_name"
              type="text"
              placeholder="Adınız Soyadınız"
              value={formData.reviewerName}
              onChange={(e) => handleInputChange('reviewerName', e.target.value)}
              className="w-full rounded-lg border-product-accent/30 bg-product-background-light focus:border-product-warm-button focus:ring-product-warm-button text-sm text-product-text-light"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={formData.rating === 0}
            className={`w-full flex items-center justify-center rounded-full h-12 px-6 text-base font-bold transition-colors ${
              formData.rating > 0
                ? 'bg-product-warm-button text-white hover:bg-opacity-90'
                : 'bg-product-accent/20 text-product-subtext-light cursor-not-allowed'
            }`}
          >
            Yorumu Gönder
          </button>
        </form>
      </div>
    </div>
  );
}