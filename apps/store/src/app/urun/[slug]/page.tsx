import Link from 'next/link'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { Breadcrumbs } from '@/components/storefront/breadcrumbs'
import { VariantSelector } from '@/components/storefront/variant-selector'
import { AccordionSpec } from '@/components/storefront/accordion-spec'
import { Button } from 'tulumbak-ui'
import { formatPrice } from '@/lib/format'

interface PageProps {
  params: {
    slug: string
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = params

  // Mock ürün detayını yükle
  let product = null
  if (slug === 'tulumba-tatlisi') {
    product = {
      "id": "p1",
      "name": "Tulumba Tatlısı",
      "slug": "tulumba-tatlisi",
      "description": "Tek kişilik klasik tulumba tatlısı. Taze hazırlanmış, çıtır dış kabuğu ve yumuşak içiyle mükemmel lezzet.",
      "images": [
        {
          "url": "/media/products/tulumba-tatlisi-1.jpg",
          "alt": "Tulumba tatlısı"
        },
        {
          "url": "/media/products/tulumba-tatlisi-2.jpg",
          "alt": "Tulumba tatlısı detay"
        }
      ],
      "price_from": 120,
      "price_to": 220,
      "is_variable": true,
      "variants": [
        {
          "id": "v1",
          "sku": "TUL-0001-W0500",
          "attrs": {
            "weight": 0.5
          },
          "price": 120
        },
        {
          "id": "v2",
          "sku": "TUL-0001-W1000",
          "attrs": {
            "weight": 1
          },
          "price": 220
        }
      ]
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-serif font-bold text-tulumbak-slate mb-4">
              Ürün Bulunamadı
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Aradığınız ürün mevcut değil.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-tulumbak-amber text-white rounded-lg hover:bg-tulumbak-amber/90 transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Breadcrumbs
  const breadcrumbItems = [
    { label: 'Ana Sayfa', href: '/' },
    { label: 'Ürünler', href: '/kategori/tulumbalar' },
    { label: product.name, href: `/urun/${product.slug}` }
  ]

  // Accordion items
  const accordionItems = [
    {
      title: 'Ürün Açıklaması',
      content: product.description || 'Bu ürün için detaylı açıklama bulunmamaktadır.'
    },
    {
      title: 'Kargo Bilgileri',
      content: 'Ürünlerimiz özel ambalajlarda, soğuk zincir korunarak teslim edilir. İstanbul içi 2-4 saat, diğer şehirlere 1-2 gün içinde teslimat yapılır.'
    },
    {
      title: 'İade ve Değişim',
      content: 'Ürünlerimiz taze olduğu için iade kabul edilmez. Ancak hasarlı teslimat durumunda ücretsiz değişim yapılır.'
    },
    {
      title: 'Besin Değerleri',
      content: '100g için: Enerji 350kcal, Karbonhidrat 45g, Protein 8g, Yağ 12g. İçerik: Un, şeker, tereyağı, yumurta, süt.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <div className="bg-tulumbak-beige py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].url}
                    alt={product.images[0].alt || product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Görsel Yok
                  </div>
                )}
              </div>
              
              {/* Thumbnail images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1).map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image.url}
                        alt={image.alt || `${product.name} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-serif font-bold text-tulumbak-slate mb-4">
                  {product.name}
                </h1>
                
                <div className="flex items-center space-x-4 mb-6">
                  {product.is_variable ? (
                    <div className="text-2xl font-bold text-tulumbak-amber">
                      {formatPrice(product.price_from)} - {formatPrice(product.price_to)}
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-tulumbak-amber">
                      {formatPrice(product.price_from)}
                    </div>
                  )}
                  {product.is_variable && (
                    <span className="text-sm text-gray-500">Farklı boyutlar mevcut</span>
                  )}
                </div>
              </div>

              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <VariantSelector
                  options={[
                    {
                      kind: 'weight',
                      values: product.variants.map(v => v.attrs.weight)
                    }
                  ]}
                  selected={{}}
                  onSelect={(selected) => {
                    console.log('Variant selected:', selected)
                  }}
                />
              )}

              {/* Add to Cart */}
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="w-full bg-tulumbak-amber hover:bg-tulumbak-amber/90 text-white"
                >
                  Sepete Ekle
                </Button>
                
                <div className="flex space-x-4">
                  <Button variant="outline" size="lg" className="flex-1">
                    Favorilere Ekle
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1">
                    Paylaş
                  </Button>
                </div>
              </div>

              {/* Product Details */}
              <AccordionSpec items={accordionItems} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
