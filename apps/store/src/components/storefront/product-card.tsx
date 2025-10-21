import Link from 'next/link'
import Image from 'next/image'
import { Button } from 'tulumbak-ui'
import { ProductCard as ProductCardType } from 'tulumbak-shared'
import { formatTL } from '@/lib/format'

export function ProductCard({ product, ctaLabel = "Sepete Ekle" }: ProductCardType) {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-white shadow-card transition-all duration-250 hover:shadow-lg hover:-translate-y-1 w-full max-w-sm mx-auto sm:max-w-none">
      {/* Mobile-first: Full width on mobile, auto on larger screens */}
      <Link href={`/urun/${product.slug}`} className="block">
        <div className="aspect-product relative overflow-hidden bg-gray-100">
          {product.image ? (
            <Image
              src={product.image.url}
              alt={product.image.alt || product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              priority={false}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-sm sm:text-base">Görsel Yok</span>
            </div>
          )}
        </div>
      </Link>

      {/* Mobile-first: Touch-friendly padding and spacing */}
      <div className="p-3 sm:p-4 transition-opacity duration-200 group-hover:opacity-90">
        <div className="space-y-2 sm:space-y-3">
          <Link href={`/urun/${product.slug}`}>
            <h3 className="font-serif font-semibold text-base sm:text-lg text-tulumbak-slate group-hover:text-tulumbak-amber transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Mobile-first: Price display */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {product.is_variable ? (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{formatTL(product.price_from)}</span>
                  <span className="mx-1">-</span>
                  <span className="font-medium">{formatTL(product.price_to)}</span>
                </div>
              ) : (
                <div className="text-base sm:text-lg font-bold text-tulumbak-amber">
                  {formatTL(product.price_from)}
                </div>
              )}
              {product.is_variable && (
                <div className="text-xs text-gray-500">Farklı boyutlar</div>
              )}
            </div>
          </div>

          {/* Mobile-first: Touch-friendly button */}
          <Button
            className="w-full bg-tulumbak-amber hover:bg-tulumbak-amber/90 text-white h-12 sm:h-10"
            size="sm"
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
