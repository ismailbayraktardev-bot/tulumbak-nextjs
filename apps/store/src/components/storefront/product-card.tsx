import Link from 'next/link'
import { Button } from 'tulumbak-ui'
import { ProductCard as ProductCardType } from 'tulumbak-shared'
import { formatPrice } from 'tulumbak-shared'

export function ProductCard({ product, ctaLabel = "Hemen Al" }: ProductCardType) {
  return (
    <div className="group bg-white rounded-2xl shadow-card hover:shadow-lg transition-all duration-300 overflow-hidden">
      <Link href={`/urun/${product.slug}`} className="block">
        <div className="aspect-product relative overflow-hidden">
          {product.image ? (
            <img
              src={product.image.url}
              alt={product.image.alt || product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">Görsel Yok</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-6">
        <div className="space-y-3">
          <Link href={`/urun/${product.slug}`}>
            <h3 className="font-serif font-semibold text-lg text-tulumbak-slate group-hover:text-tulumbak-amber transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {product.is_variable ? (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{formatPrice(product.price_from)}</span>
                  <span className="mx-1">-</span>
                  <span className="font-medium">{formatPrice(product.price_to)}</span>
                </div>
              ) : (
                <div className="text-lg font-bold text-tulumbak-amber">
                  {formatPrice(product.price_from)}
                </div>
              )}
              {product.is_variable && (
                <div className="text-xs text-gray-500">Farklı boyutlar</div>
              )}
            </div>
          </div>

          <Button 
            className="w-full bg-tulumbak-amber hover:bg-tulumbak-amber/90 text-white"
            size="sm"
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
