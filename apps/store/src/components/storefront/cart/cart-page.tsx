'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCartItems, useCartTotals, useCartLoading, useCartError, useCartActions, CartItemWithProduct } from '@/store/cart-store';
import { CartItem } from '@/components/storefront/cart/cart-item';
import { CartSummary } from '@/components/storefront/cart/cart-summary';
import { EmptyCart } from '@/components/storefront/cart/empty-cart';
import { formatTL } from '@/lib/format';

export function CartPage() {
  const items = useCartItems() as CartItemWithProduct[];
  const totals = useCartTotals();
  const isLoading = useCartLoading();
  const error = useCartError();
  const { clearCart } = useCartActions();

  const [isClearing, setIsClearing] = useState(false);

  const handleClearCart = async () => {
    if (window.confirm('Sepetinizdeki tüm ürünler silinecek. Emin misiniz?')) {
      setIsClearing(true);
      try {
        await clearCart();
      } finally {
        setIsClearing(false);
      }
    }
  };

  if (isLoading && items.length === 0) {
    return <CartPageSkeleton />;
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile-first: Page Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Sepetim</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Sepetinizde {items.length} ürün var ({items.reduce((count, item) => count + item.quantity, 0)} adet)
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        {/* Mobile-first: Cart Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {/* Mobile-first: Error Display */}
            {error && (
              <Card className="border-destructive">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center gap-2 text-destructive">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm sm:text-base">{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mobile-first: Cart Items List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">Ürünler</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCart}
                  disabled={isClearing || isLoading}
                  className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                >
                  {isClearing ? 'Siliniyor...' : 'Temizle'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </CardContent>
            </Card>

            {/* Mobile-first: Continue Shopping */}
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline text-sm sm:text-base">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Alışverişe Devam Et
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Mobile-first: Cart Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 sm:top-6 lg:top-8">
              <CartSummary />
            </div>
          </div>
        </div>

        {/* Mobile-first: Trust Badges */}
        <div className="mt-6 sm:mt-8 lg:mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1 sm:gap-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="hidden sm:inline">Güvenli Ödeme</span>
              <span className="sm:hidden">Güvenli</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="hidden sm:inline">Hızlı Teslimat</span>
              <span className="sm:hidden">Hızlı</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="hidden sm:inline">Taze Ürünler</span>
              <span className="sm:hidden">Taze</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="hidden sm:inline">Müşteri Desteği</span>
              <span className="sm:hidden">Destek</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton component for loading state
export function CartPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Mobile-first: Page Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="h-6 sm:h-8 w-24 sm:w-32 bg-muted rounded animate-pulse mb-2"></div>
        <div className="h-3 sm:h-4 w-40 sm:w-64 bg-muted rounded animate-pulse"></div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Mobile-first: Cart Items Skeleton */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 sm:h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                      <div className="h-2 sm:h-3 w-1/2 bg-muted rounded animate-pulse"></div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-3 sm:h-4 w-16 sm:w-20 bg-muted rounded animate-pulse"></div>
                      <div className="h-6 sm:h-8 w-16 sm:w-24 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mobile-first: Cart Summary Skeleton */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="h-5 sm:h-6 w-20 sm:w-24 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 sm:h-4 w-12 sm:w-16 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 sm:h-4 w-16 sm:w-20 bg-muted rounded animate-pulse"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 sm:h-4 w-10 sm:w-12 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 sm:h-4 w-16 sm:w-20 bg-muted rounded animate-pulse"></div>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <div className="h-4 sm:h-5 w-12 sm:w-16 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 sm:h-5 w-20 sm:w-24 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-10 sm:h-12 w-full bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
