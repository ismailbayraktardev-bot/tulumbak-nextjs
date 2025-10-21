import { Suspense } from 'react';
import { Metadata } from 'next';
import { CartPage } from '@/components/storefront/cart/cart-page';
import { CartPageSkeleton } from '@/components/storefront/cart/cart-page-skeleton';

export const metadata: Metadata = {
  title: 'Sepetim - Tulumbak',
  description: 'Sepetinizdeki ürünleri görüntüleyin ve ödeme işlemine geçin.',
};

export default function CartPageRoute() {
  return (
    <Suspense fallback={<CartPageSkeleton />}>
      <CartPage />
    </Suspense>
  );
}
