'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/storefront/navbar';
import { Footer } from '@/components/storefront/footer';
import { ProductGallery } from '@/components/features/product/ProductGallery';
import { ProductInfo } from '@/components/features/product/ProductInfo';
import { ProductTabs } from '@/components/features/product/ProductTabs';
import { ReviewSection } from '@/components/features/product/ReviewSection';
import { RecentlyViewed } from '@/components/features/product/RecentlyViewed';
import { Product, Review, ReviewForm, ProductTabs as ProductTabsType } from '@/types/product';
import { getMockProductBySlug, getMockProductReviews, getMockRecentlyViewed } from '@/lib/mock-data';
import { useCartStore } from '@/store/cart-store';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ProductPage({ params }: PageProps) {
  const [slug, setSlug] = useState<string>('');
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { addItem } = useCartStore();

  // Resolve params
  useEffect(() => {
    params.then((resolved) => {
      setSlug(resolved.slug);
    });
  }, [params]);

  // Load product data
  useEffect(() => {
    if (!slug) return;

    const loadProduct = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        const productData = getMockProductBySlug(slug);
        const reviewsData = getMockProductReviews(slug);
        const recentlyViewedData = getMockRecentlyViewed();

        setProduct(productData || null);
        setReviews(reviewsData);
        setRecentlyViewed(recentlyViewedData);
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  // Handle add to cart
  const handleAddToCart = (quantity: number, weightId: string) => {
    if (!product) return;

    const weightOption = product.weightOptions.find(option => option.id === weightId);
    if (!weightOption) return;

    addItem({
      id: product.id,
      name: product.name,
      price: weightOption.price,
      quantity,
      image: product.images[0],
      variant: {
        weight: weightOption.label,
        serving: null
      }
    });
  };

  // Handle review submission
  const handleReviewSubmit = (review: ReviewForm) => {
    // In a real app, this would be an API call
    const newReview: Review = {
      id: `review_${Date.now()}`,
      rating: review.rating,
      title: review.title,
      content: review.content,
      reviewer: {
        name: review.reviewerName
      },
      date: new Date().toISOString(),
      verified: false,
      helpful: 0
    };

    setReviews(prev => [newReview, ...prev]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-product-background-light">
        <Navbar />
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-product-accent/30 border-t-product-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-product-subtext-light">Yükleniyor...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-product-background-light">
        <Navbar />
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-3xl font-product-display font-bold text-product-text-light mb-4">
              Ürün Bulunamadı
            </h1>
            <p className="text-product-subtext-light mb-6">
              Aradığınız ürün mevcut değil.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-product-primary text-white rounded-full hover:bg-opacity-90 transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Breadcrumbs
  const breadcrumbItems = [
    { label: 'Ana Sayfa', href: '/' },
    { label: 'Tatlılar', href: '/kategori/tatlilar' },
    { label: product.category.name, href: `/kategori/${product.category.slug}` },
    { label: product.name, href: `/urun/${product.slug}` }
  ];

  // Product tabs data
  const productTabs: ProductTabsType = {
    description: product.description,
    ingredients: product.ingredients,
    allergens: product.allergens,
    nutritionalInfo: {
      calories: 450,
      protein: 8,
      carbs: 65,
      fat: 18,
      serving: '100g'
    }
  };

  return (
    <div className="min-h-screen bg-product-background-light font-product-body">
      <Navbar />
      
      <main className="px-4 md:px-10 lg:px-20 xl:px-40 py-8">
        <div className="layout-content-container flex flex-col max-w-[1200px] mx-auto w-full">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap gap-2 pb-8">
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <span className="text-product-subtext-light text-sm font-medium">/</span>
                )}
                {index === breadcrumbItems.length - 1 ? (
                  <span className="text-product-text-light text-sm font-medium">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-product-subtext-light text-sm font-medium hover:text-product-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Gallery */}
            <ProductGallery
              images={product.images}
              alt={product.name}
            />

            {/* Product Info */}
            <ProductInfo
              product={product}
              onAddToCart={handleAddToCart}
            />
          </div>

          {/* Product Tabs */}
          <ProductTabs
            tabs={productTabs}
            reviews={
              <ReviewSection
                reviews={reviews}
                onReviewSubmit={handleReviewSubmit}
              />
            }
          />

          {/* Recently Viewed */}
          <RecentlyViewed
            products={recentlyViewed}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
