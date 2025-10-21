import Link from 'next/link'
import { Navbar } from '@/components/storefront/navbar'
import { ProductGrid } from '@/components/storefront/product-grid'
import { Footer } from '@/components/storefront/footer'
import { Breadcrumbs } from '@/components/storefront/breadcrumbs'
import { FilterBar } from '@/components/storefront/filter-bar'
import { EmptyState } from '@/components/storefront/empty-state'
import { apiGet } from '@/lib/api'
import { Category } from '@/lib/types'
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

interface PageProps {
  params: {
    slug: string
  }
  searchParams: {
    weight?: string
    min_price?: string
    max_price?: string
    sort?: string
    page?: string
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = params
  const { weight, min_price, max_price, sort, page } = searchParams

  // Kategori bilgisini çek
  let category: Category | null = null
  try {
    const response = await apiGet<{ success: boolean; data: Category[] }>('/categories')
    category = response.data?.find(cat => cat.slug === slug) || null
  } catch (error) {
    console.error('Kategori yüklenirken hata:', error)
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-serif font-bold text-tulumbak-slate mb-4">
              Kategori Bulunamadı
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Aradığınız kategori mevcut değil.
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

  // Mock ürün verilerini filtrele (gerçek uygulamada API'den gelecek)
  let filteredProducts = products

  // Fiyat filtresi
  if (min_price) {
    const minPrice = parseFloat(min_price)
    filteredProducts = filteredProducts.filter(p => p.price_from >= minPrice)
  }
  if (max_price) {
    const maxPrice = parseFloat(max_price)
    filteredProducts = filteredProducts.filter(p => p.price_from <= maxPrice)
  }

  // Ağırlık filtresi (mock)
  if (weight) {
    const weightValue = parseFloat(weight)
    // Mock: sadece tulumba tatlısı için ağırlık filtresi
    if (weightValue === 0.5) {
      filteredProducts = filteredProducts.filter(p => p.slug === 'tulumba-tatlisi')
    }
  }

  // Sıralama
  if (sort === 'price_asc') {
    filteredProducts.sort((a, b) => a.price_from - b.price_from)
  } else if (sort === 'price_desc') {
    filteredProducts.sort((a, b) => b.price_from - a.price_from)
  }

  // Breadcrumbs
  const breadcrumbItems = [
    { label: 'Ana Sayfa', href: '/' },
    { label: category.name, href: `/kategori/${category.slug}` }
  ]

  // Filter state
  const filterState = {
    category: slug,
    weight: weight ? parseFloat(weight) : null,
    priceRange: min_price && max_price ? [parseFloat(min_price), parseFloat(max_price)] as [number, number] : undefined,
    sort: sort as 'price_asc' | 'price_desc' | 'newest' | 'bestseller' | undefined,
    page: page ? parseInt(page) : 1
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <div className="bg-tulumbak-beige py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={breadcrumbItems} />
            
            <div className="mt-8">
              <h1 className="text-4xl font-serif font-bold text-tulumbak-slate mb-4">
                {category.name}
              </h1>
              <p className="text-lg text-gray-600">
                {filteredProducts.length} ürün bulundu
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters */}
            <div className="lg:w-1/4">
              <FilterBar
                categories={[{ id: category.id, name: category.name, slug: category.slug }]}
                selectedCategory={slug}
                weight={filterState.weight}
                priceRange={filterState.priceRange}
                onChange={(newState) => {
                  // URL güncelleme (client-side'da yapılacak)
                  console.log('Filter changed:', newState)
                }}
              />
            </div>

            {/* Products */}
            <div className="lg:w-3/4">
              {filteredProducts.length > 0 ? (
                <ProductGrid products={filteredProducts} />
              ) : (
                <EmptyState
                  title="Ürün Bulunamadı"
                  description="Aradığınız kriterlere uygun ürün bulunamadı. Filtreleri değiştirmeyi deneyin."
                  action={{
                    label: "Filtreleri Sıfırla",
                    href: `/kategori/${slug}`
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
