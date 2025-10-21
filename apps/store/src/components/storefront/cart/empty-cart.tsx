'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Package, ArrowRight } from 'lucide-react';

export function EmptyCart() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="text-center py-16">
        <CardContent className="space-y-6">
          {/* Empty Cart Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <ShoppingCart className="w-24 h-24 text-muted-foreground/30" />
              <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2">
                <Package className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
          </div>

          {/* Empty Cart Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Sepetiniz Boş
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Henüz sepetinize ürün eklemediniz. Lezzetli tatlılarımızı keşfetmek için 
              alışverişe devam edin.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="min-w-[160px]">
              <Link href="/" className="inline-flex items-center gap-2">
                <Package className="w-5 h-5" />
                Alışverişe Başla
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="min-w-[160px]">
              <Link href="/kategoriler" className="inline-flex items-center gap-2">
                Kategorileri Keşfet
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Popular Categories */}
          <div className="border-t pt-8">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Popüler Kategoriler
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Baklavalar', href: '/kategori/baklava' },
                { name: 'Tulumba', href: '/kategori/tulumba' },
                { name: 'Şerbetli Tatlılar', href: '/kategori/serbetli-tatlılar' },
                { name: 'Sütlü Tatlılar', href: '/kategori/sutlu-tatlılar' },
              ].map((category) => (
                <Button
                  key={category.name}
                  asChild
                  variant="ghost"
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-muted/50"
                >
                  <Link href={category.href}>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="border-t pt-8">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Güvenli Ödeme</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Hızlı Teslimat</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Taze Ürünler</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Müşteri Desteği</span>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-muted/30 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold mb-2 text-foreground">
              Yardıma mı ihtiyacınız var?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sipariş süreci, ürünlerimiz veya teslimat hakkında sorularınız mı var? 
              Müşteri hizmetlerimiz size yardımcı olmaktan memnuniyet duyar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" size="sm" asChild>
                <Link href="/yardim">Yardım Merkezi</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/iletisim">İletişim</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
