import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { Breadcrumbs } from '@/components/storefront/breadcrumbs'
import { AccordionSpec } from '@/components/storefront/accordion-spec'
import { Button } from 'tulumbak-ui'
import { formatTL } from '@/lib/format'
import { apiGet } from '@/lib/api'
import { Product, ApiResponse } from '@/lib/types'
import { getMockProductBySlug } from '@/lib/mock-data'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProductPage({ params }: PageProps) {
  // Next.js 15: Await params
  const { slug } = await params

  // Ürün detayını yükle (mock data fallback ile)
  let product: Product | null = null
  try {
    const response = await apiGet<ApiResponse<Product>>(`/products/${slug}`, 60)
    product = response.data || null
  } catch (error) {
    console.error('Ürün detayı yüklenirken hata:', error)
    // Mock data fallback
    product = getMockProductBySlug(slug) || null
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="py-8 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-tulumbak-slate mb-4">
              Ürün Bulunamadı
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8">
              Aradığınız ürün mevcut değil.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-tulumbak-amber text-white rounded-lg hover:bg-tulumbak-amber/90 transition-colors"
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
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt || product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={true}
                    className="object-cover"
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
                      <Image
                        src={image.url}
                        alt={image.alt || `${product.name} ${index + 2}`}
                        width={150}
                        height={150}
                        sizes="(max-width: 768px) 25vw, 12.5vw"
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
                  {product.type === 'variable' ? (
                    <div className="text-2xl font-bold text-tulumbak-amber">
                      Fiyat aralığı mevcut
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-tulumbak-amber">
                      {formatTL(product.price || 0)}
                    </div>
                  )}
                  {product.type === 'variable' && (
                    <span className="text-sm text-gray-500">Farklı boyutlar mevcut</span>
                  )}
                </div>
              </div>

              {/* Variant Selector - Placeholder for variable products */}
              {product.type === 'variable' && (
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Bu ürün için farklı varyantlar mevcut. Gerçek varyant seçimi FE-03&apos;te implement edilecek.
                  </p>
                </div>
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
