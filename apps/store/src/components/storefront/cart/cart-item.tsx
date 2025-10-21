'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCartActions } from '@/store/cart-store';
import { formatTL } from '@/lib/format';
import { CartItemWithProduct } from '@/store/cart-store';

interface CartItemProps {
  item: CartItemWithProduct;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartActions();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    try {
      await updateQuantity(item.id, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (window.confirm('Bu ürünü sepetten kaldırmak istediğinizden emin misiniz?')) {
      setIsUpdating(true);
      try {
        await removeItem(item.id);
      } catch (error) {
        console.error('Failed to remove item:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {/* Product Image */}
          <div className="relative w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 64px, 64px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Link 
                  href={`/urun/${item.slug}`}
                  className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
                >
                  {item.name}
                </Link>
                
                {/* Variant Info */}
                {item.variant && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    {item.variant.weight && (
                      <span className="mr-2">{item.variant.weight}g</span>
                    )}
                    {item.variant.serving && (
                      <span>{item.variant.serving} Kişilik</span>
                    )}
                  </div>
                )}

                {/* Stock Status */}
                {item.stock <= 5 && item.stock > 0 && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Son {item.stock} ürün
                  </Badge>
                )}
                {item.stock === 0 && (
                  <Badge variant="destructive" className="mt-2 text-xs">
                    Stokta yok
                  </Badge>
                )}
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                <div className="font-semibold text-lg">
                  {formatTL(item.total_price)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatTL(item.unit_price)} / adet
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Adet:</span>
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={isUpdating || item.quantity <= 1}
                className="h-8 w-8 p-0"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </Button>
              
              <div className="w-12 text-center text-sm font-medium">
                {item.quantity}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isUpdating || (item.stock > 0 && item.quantity >= item.stock)}
                className="h-8 w-8 p-0"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Button>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={isUpdating}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Kaldır
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
