import { Navbar } from '@/components/storefront/navbar'
import { Hero } from '@/components/storefront/hero'
import { CategoryTiles } from '@/components/storefront/category-tiles'
import { ProductGrid } from '@/components/storefront/product-grid'
import { Footer } from '@/components/storefront/footer'
import { apiGet } from '@/lib/api'
import { Category, ProductSummary } from '@/lib/types'
// Mock products data
const products = [
  {
    "id": "p1",
    "name": "Tulumba Tatlısı",
    "slug": "tulumba-tatlisi",
    "image": {
      "url": "/media/products/tulumba-tatlisi-1.jpg",
      "alt": "Tulumba tatlısı"
    },
    "price_from": 120,
    "price_to": 120,
    "is_variable": false
  },
  {
    "id": "p2",
    "name": "Soğuk Baklava (Fıstıklı)",
    "slug": "soguk-baklava-fistikli",
    "image": {
      "url": "/media/products/soguk-baklava-fistikli-1.jpg",
      "alt": "Soğuk baklava fıstıklı"
    },
    "price_from": 390,
    "price_to": 390,
    "is_variable": false
  },
  {
    "id": "p3",
    "name": "Künefe (Peynirli)",
    "slug": "kunefe-peynirli",
    "image": {
      "url": "/media/products/kunefe-peynirli-1.jpg",
      "alt": "Künefe peynirli"
    },
    "price_from": 280,
    "price_to": 280,
    "is_variable": false
  },
  {
    "id": "p4",
    "name": "Kazandibi",
    "slug": "kazandibi",
    "image": {
      "url": "/media/products/kazandibi-1.jpg",
      "alt": "Kazandibi"
    },
    "price_from": 180,
    "price_to": 180,
    "is_variable": false
  },
  {
    "id": "p5",
    "name": "Sütlaç",
    "slug": "sutlac",
    "image": {
      "url": "/media/products/sutlac-1.jpg",
      "alt": "Sütlaç"
    },
    "price_from": 150,
    "price_to": 150,
    "is_variable": false
  },
  {
    "id": "p6",
    "name": "Revani",
    "slug": "revani",
    "image": {
      "url": "/media/products/revani-1.jpg",
      "alt": "Revani"
    },
    "price_from": 200,
    "price_to": 200,
    "is_variable": false
  }
]

export default async function Home() {
  // Canlı API'den kategori verilerini çek
  let categories: Category[] = []
  try {
    const response = await apiGet<{ success: boolean; data: Category[] }>('/categories')
    categories = response.data || []
  } catch (error) {
    console.error('Kategoriler yüklenirken hata:', error)
    // Fallback mock kategoriler
    categories = [
      { id: '1', name: 'Tulumbalar', slug: 'tulumbalar', parent_id: null, position: 1, is_active: true, created_at: '', updated_at: '' },
      { id: '2', name: 'Baklavalar', slug: 'baklavalar', parent_id: null, position: 2, is_active: true, created_at: '', updated_at: '' },
      { id: '3', name: 'Sütlaçlar', slug: 'sutlaclar', parent_id: null, position: 3, is_active: true, created_at: '', updated_at: '' }
    ]
  }

  // Mock ürün verilerini kullan
  const featuredProducts: ProductSummary[] = products.slice(0, 6)

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

        <CategoryTiles items={categoryTiles} />

        <section className="py-16 bg-tulumbak-beige">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-tulumbak-slate mb-4">
                Öne Çıkan Ürünler
              </h2>
              <p className="text-lg text-gray-600">
                En çok tercih edilen tatlılarımız
              </p>
            </div>

            <ProductGrid products={featuredProducts} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
