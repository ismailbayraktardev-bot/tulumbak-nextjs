import Link from 'next/link'
import { Suspense } from 'react'
import { Navbar } from '@/components/storefront/navbar'
import { ProductGrid } from '@/components/storefront/product-grid'
import { Footer } from '@/components/storefront/footer'
import { Breadcrumbs } from '@/components/storefront/breadcrumbs'
import { EmptyState } from '@/components/storefront/empty-state'
import { ProductGridSkeleton } from '@/components/storefront/skeletons'
import { apiGet } from '@/lib/api'
import { Category, ProductSummary, PaginatedResponse } from '@/lib/types'
import { getMockCategoryBySlug, getMockProductsByCategory } from '@/lib/mock-data'
// Client component for filters
import { CategoryFilterClient } from '@/components/storefront/category-filter-client'

interface PageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    weight?: string
    min_price?: string
    max_price?: string
    sort?: string
    page?: string
  }>
}

async function CategoryPageContent({ params, searchParams }: PageProps) {
  // Next.js 15: Await params and searchParams
  const { slug } = await params
  const { weight, min_price, max_price, sort, page } = await searchParams

  // Kategori bilgisini çek (mock data fallback ile)
  let category: Category | null = null
  try {
    const response = await apiGet<{ success: boolean; data: Category[] }>('/categories')
    category = response.data?.find(cat => cat.slug === slug) || null
  } catch (error) {
    console.error('Kategori yüklenirken hata:', error)
    // Mock data fallback
    category = getMockCategoryBySlug(slug) || null
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

  // Ürün verilerini çek (mock data fallback ile)
  let products: ProductSummary[] = []
  
  try {
    const queryParams = new URLSearchParams({
      category: slug,
      page: page || '1',
      per_page: '12',
      sort: sort || 'price_asc'
    })
    
    if (weight) queryParams.append('weight', weight)
    if (min_price) queryParams.append('min_price', min_price)
    if (max_price) queryParams.append('max_price', max_price)
    
    const response = await apiGet<PaginatedResponse<ProductSummary>>(
      `/products?${queryParams.toString()}`,
      60 // revalidate 60s
    )
    
    products = response.data || []
  } catch (error) {
    console.error('Ürünler yüklenirken hata:', error)
    // Mock data fallback
    products = getMockProductsByCategory(slug)
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
        {/* Mobile-first: Category Header */}
        <div className="bg-tulumbak-beige py-4 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={breadcrumbItems} />
           
            <div className="mt-4 sm:mt-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-tulumbak-slate mb-2 sm:mb-4">
                {category.name}
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                {products.length} ürün bulundu
              </p>
            </div>
          </div>
        </div>

        {/* Mobile-first: Category Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Mobile-first: Filters */}
            <div className="lg:w-1/4">
              {/* Mobile filter pills - Sticky on mobile */}
              <div className="lg:hidden sticky top-20 z-40 bg-white border-b pb-4 mb-4">
                <div className="flex overflow-x-auto space-x-2 pb-2">
                  <span className="px-3 py-1 bg-tulumbak-amber text-white text-sm rounded-full whitespace-nowrap">
                    Tümü
                  </span>
                  {weight && (
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full whitespace-nowrap">
                      {weight}g
                    </span>
                  )}
                  {(min_price || max_price) && (
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full whitespace-nowrap">
                      Fiyat
                    </span>
                  )}
                </div>
              </div>
              
              {/* Desktop filter sidebar */}
              <div className="hidden lg:block">
                <CategoryFilterClient
                  category={{ id: category.id, name: category.name, slug: category.slug }}
                  initialWeight={filterState.weight}
                  initialPriceRange={filterState.priceRange}
                />
              </div>
            </div>

            {/* Mobile-first: Products */}
            <div className="lg:w-3/4">
              {products.length > 0 ? (
                <ProductGrid products={products} />
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

export default function CategoryPage({ params, searchParams }: PageProps) {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <CategoryPageContent params={params} searchParams={searchParams} />
    </Suspense>
  )
}
