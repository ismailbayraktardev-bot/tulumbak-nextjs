'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCartItems, useCartTotals } from '@/store/cart-store';
import { formatTL } from '@/lib/format';
import { ShoppingCart, Truck, Shield } from 'lucide-react';

export function CartSummary() {
  const items = useCartItems();
  const totals = useCartTotals();

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Sipariş Özeti
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Items Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Ürün Adedi ({itemCount} ürün)
          </span>
          <Badge variant="secondary">{itemCount}</Badge>
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ara Toplam</span>
            <span>{formatTL(totals.subtotal)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">KDV (%18)</span>
            <span>{formatTL(totals.tax)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Kargo</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Ücretsiz
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold text-base">Genel Toplam</span>
            <span className="font-bold text-lg text-primary">
              {formatTL(totals.total)}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button 
          asChild 
          className="w-full" 
          size="lg"
          disabled={items.length === 0}
        >
          <Link href="/odeme">
            Ödemeye Geç
          </Link>
        </Button>

        {/* Trust Indicators */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="w-4 h-4" />
            <span>Aynı gün kargo</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Güvenli ödeme</span>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          <p>
            Kargo süresi ve teslimat bilgileri için{' '}
            <Link href="/yardim" className="text-primary hover:underline">
              yardım sayfasını
            </Link>{' '}
            ziyaret edin.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
