import { Suspense } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/storefront/navbar'
import { Hero } from '@/components/storefront/hero'
import { CategoryTiles } from '@/components/storefront/category-tiles'
import { ProductGrid } from '@/components/storefront/product-grid'
import { Footer } from '@/components/storefront/footer'
import { CategoryTilesSkeleton, ProductGridSkeleton } from '@/components/storefront/skeletons'
import { Button } from 'tulumbak-ui'
import { apiGet } from '@/lib/api'
import { Category, ProductSummary } from '@/lib/types'
import { mockCategories, mockProducts, getMockFeaturedProducts } from '@/lib/mock-data'

export default async function Home() {
  // API'den kategori verilerini çek (mock data fallback ile)
  let categories: Category[] = []
  try {
    const response = await apiGet<{ success: boolean; data: Category[] }>('/categories')
    categories = response.data || []
  } catch (error) {
    console.error('Kategoriler yüklenirken hata:', error)
    // Mock data fallback
    categories = mockCategories
  }

  // Öne çıkan ürünleri çek (mock data fallback ile)
  let featuredProducts: ProductSummary[] = []
  try {
    const response = await apiGet<{ success: boolean; data: ProductSummary[] }>('/products?featured=true')
    featuredProducts = response.data || []
  } catch (error) {
    console.error('Öne çıkan ürünler yüklenirken hata:', error)
    // Mock data fallback
    featuredProducts = getMockFeaturedProducts(6)
  }

  // Kategori tiles için veri hazırla
  const categoryTiles = categories.map(category => ({
    title: category.name,
    href: `/kategori/${category.slug}`,
    image: {
      src: `/media/categories/${category.slug}.jpg`,
      alt: category.name
    }
  }))

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <Hero
          title="Türkiye'nin En Lezzetli Tatlıları"
          subtitle="Taze hazırlanmış, geleneksel tariflerle yapılmış tatlılarımızla damak zevkinizi tatmin edin."
          cta={{
            label: "Hemen Sipariş Ver",
            href: "/kategori/tulumbalar"
          }}
          image={{
            src: "/media/hero/tulumbak-hero.jpg",
            alt: "Tulumbak tatlıları"
          }}
        />

        <Suspense fallback={<CategoryTilesSkeleton />}>
          <CategoryTiles items={categoryTiles} />
        </Suspense>

        <section className="py-8 sm:py-16 bg-tulumbak-beige">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Mobile-first: Section Header */}
            <div className="text-center mb-6 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-tulumbak-slate mb-2 sm:mb-4">
                Öne Çıkan Ürünler
              </h2>
              <p className="text-base sm:text-lg text-gray-600">
                En çok tercih edilen tatlılarımız
              </p>
            </div>

            {/* Mobile-first: Product Grid */}
            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductGrid products={featuredProducts} />
            </Suspense>
            
            {/* Mobile-first: View All Button */}
            <div className="text-center mt-8 sm:mt-12">
              <Link href="/kategori/tulumbalar">
                <Button
                  size="lg"
                  className="bg-tulumbak-amber hover:bg-tulumbak-amber/90 text-white h-12 sm:h-14 px-6 sm:px-8"
                >
                  Tüm Ürünleri Gör
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
