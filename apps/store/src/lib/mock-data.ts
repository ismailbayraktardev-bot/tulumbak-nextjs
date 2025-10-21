/**
 * Mock data for frontend development
 * Used when backend API is not available
 */

// Mock categories
export const mockCategories = [
  {
    id: 'cat_tulumbalar',
    name: 'Tulumbalar',
    slug: 'tulumbalar',
    parent_id: null,
    position: 1,
    is_active: true,
    image: {
      url: '/media/kategori-img/tulumba.png',
      alt: 'Tulumbalar'
    },
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'cat_baklavalar',
    name: 'Baklavalar',
    slug: 'baklavalar',
    parent_id: null,
    position: 2,
    is_active: true,
    image: {
      url: '/media/kategori-img/kategori-baklava.png',
      alt: 'Baklavalar'
    },
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'cat_sutlu_tatlilar',
    name: 'Sütlü Tatlılar',
    slug: 'sutlu-tatlilar',
    parent_id: null,
    position: 3,
    is_active: true,
    image: {
      url: '/media/kategori-img/sutlu-tatli.png',
      alt: 'Sütlü Tatlılar'
    },
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'cat_serbetli_tatlilar',
    name: 'Şerbetli Tatlılar',
    slug: 'serbetli-tatlilar',
    parent_id: null,
    position: 4,
    is_active: true,
    image: {
      url: '/media/kategori-img/serbetli-tatli.png',
      alt: 'Şerbetli Tatlılar'
    },
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'cat_ozel_lezzetler',
    name: 'Özel Lezzetler',
    slug: 'ozel-lezzetler',
    parent_id: null,
    position: 5,
    is_active: true,
    image: {
      url: '/media/kategori-img/ozel-paketler.png',
      alt: 'Özel Lezzetler'
    },
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  }
];

// Mock products
export const mockProducts = [
  // Tulumbalar
  {
    id: 'p1',
    type: 'simple' as const,
    name: 'Klasik Tulumba Tatlısı',
    slug: 'klasik-tulumba-tatlisi',
    category_id: 'cat_tulumbalar',
    description: 'Geleneksel tarifle hazırlanmış, altın renginde, çıtır tulumba tatlısı. Şerbetiyle buluştuğunda damaklarda unutulmaz bir lezzet bırakır.',
    sku: 'TUL-0001',
    price: 120,
    stock_mode: 'product' as const,
    stock_qty: 50,
    images: [
      {
        url: '/media/products/tulumba-tatlisi-1.jpg',
        alt: 'Klasik Tulumba Tatlısı'
      }
    ],
    tax_included: true,
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'p2',
    type: 'simple' as const,
    name: 'Antep Fıstıklı Tulumba',
    slug: 'antep-fistikli-tulumba',
    category_id: 'cat_tulumbalar',
    description: 'İçine ve üzerine bol Antep fıstığı serpilmiş, özel şerbetiyle harmanlanmış tulumba. Fıstık tutkunlarının vazgeçilmezi.',
    sku: 'TUL-0002',
    price: 220,
    stock_mode: 'product' as const,
    stock_qty: 30,
    images: [
      {
        url: '/media/products/antep-fistikli-tulumba-1.jpg',
        alt: 'Antep Fıstıklı Tulumba'
      }
    ],
    tax_included: true,
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'p3',
    type: 'simple' as const,
    name: 'Çikolatalı Tulumba',
    slug: 'cikolatali-tulumba',
    category_id: 'cat_tulumbalar',
    description: 'Belçika çikolatasıyla kaplanmış, üzerine kakao tozu serpilmiş modern tulumba. Çikolata severler için özel.',
    sku: 'TUL-0003',
    price: 180,
    stock_mode: 'product' as const,
    stock_qty: 25,
    images: [
      {
        url: '/media/products/cikolatali-tulumba-1.jpg',
        alt: 'Çikolatalı Tulumba'
      }
    ],
    tax_included: true,
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  
  // Baklavalar
  {
    id: 'p4',
    type: 'variable' as const,
    name: 'Cevizli Klasik Baklava',
    slug: 'cevizli-klasik-baklava',
    category_id: 'cat_baklavalar',
    description: 'İncecik açılmış yufkalar arasına bol ceviz serpilmiş, özel şerbetiyle hazırlanmış klasik baklava. Geleneksel lezzetin zirvesi.',
    sku: 'BAK-0001',
    price: null,
    stock_mode: 'variant' as const,
    stock_qty: 40,
    images: [
      {
        url: '/media/products/cevizli-klasik-baklava-1.jpg',
        alt: 'Cevizli Klasik Baklava'
      }
    ],
    tax_included: true,
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'p5',
    type: 'simple' as const,
    name: 'Fıstıklı Kaymaklı Midye Baklava',
    slug: 'fistikli-kaymakli-midye-baklava',
    category_id: 'cat_baklavalar',
    description: 'Midye şeklinde sarılmış, içine kaymak ve Antep fıstığı konulmuş özel baklava. Tek ısırıkta büyüleyici lezzet.',
    sku: 'BAK-0002',
    price: 390,
    stock_mode: 'product' as const,
    stock_qty: 15,
    images: [
      {
        url: '/media/products/fistikli-kaymakli-midye-baklava-1.jpg',
        alt: 'Fıstıklı Kaymaklı Midye Baklava'
      }
    ],
    tax_included: true,
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  
  // Sütlü Tatlılar
  {
    id: 'p6',
    name: 'Soğuk Baklava (Fıstıklı)',
    slug: 'soguk-baklava-fistikli',
    type: 'simple' as const,
    category_id: 'cat_sutlu_tatlilar',
    category_slug: 'sutlu-tatlilar',
    description: 'Buz gibi soğuk, sütlü şerbetiyle ıslatılmış, üzerine bol Antep fıstığı serpilmiş yaz tatlısı. Yaz sıcağında ferahlata getirir.',
    price: 390,
    price_from: 390,
    price_to: 390,
    is_variable: false,
    sku: 'SUT-0001',
    stock_qty: 20,
    images: [
      {
        url: '/media/products/soguk-baklava-fistikli-1.jpg',
        alt: 'Soğuk Baklava (Fıstıklı)'
      }
    ],
    tags: ['sütlü', 'baklava', 'fıstık', 'soğuk'],
    tax_included: true,
    is_active: true,
    is_featured: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'p7',
    name: 'Cevizli Sütlü Nuriye',
    slug: 'cevizli-sutlu-nuriye',
    type: 'simple' as const,
    category_id: 'cat_sutlu_tatlilar',
    category_slug: 'sutlu-tatlilar',
    description: 'Yumuşacık dokusu, sütlü şerbeti ve bol ceviziyle bilinen klasik tatlı. İçimi rahat, lezzeti unutulmaz.',
    price: 250,
    price_from: 250,
    price_to: 250,
    is_variable: false,
    sku: 'SUT-0002',
    stock_qty: 35,
    images: [
      {
        url: '/media/products/cevizli-sutlu-nuriye-1.jpg',
        alt: 'Cevizli Sütlü Nuriye'
      }
    ],
    tags: ['sütlü', 'ceviz', 'nuriye', 'klasik'],
    tax_included: true,
    is_active: true,
    is_featured: false,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'p8',
    name: 'Künefe (Peynirli)',
    slug: 'kunefe-peynirli',
    type: 'simple' as const,
    category_id: 'cat_sutlu_tatlilar',
    category_slug: 'sutlu-tatlilar',
    description: 'Tel kadayıf arasına taze peynir konulmuş, üzeri kızartılmış, şerbetiyle servis edilen Hatay özel lezzeti.',
    price: 280,
    price_from: 280,
    price_to: 280,
    is_variable: false,
    sku: 'SUT-0003',
    stock_qty: 25,
    images: [
      {
        url: '/media/products/kunefe-peynirli-1.jpg',
        alt: 'Künefe (Peynirli)'
      }
    ],
    tags: ['sütlü', 'peynirli', 'künefe', 'Hatay'],
    tax_included: true,
    is_active: true,
    is_featured: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  
  // Şerbetli Tatlılar
  {
    id: 'p9',
    name: 'Halka Tatlısı',
    slug: 'halka-tatlisi',
    type: 'simple' as const,
    category_id: 'cat_serbetli_tatlilar',
    category_slug: 'serbetli-tatlilar',
    description: 'Halka şeklinde, çıtır ve şerbetli klasik tatlı. Çay saatlerinin vazgeçilmezi.',
    price: 40,
    price_from: 40,
    price_to: 40,
    is_variable: false,
    sku: 'SER-0001',
    stock_qty: 60,
    images: [
      {
        url: '/media/products/halka-tatlisi-1.jpg',
        alt: 'Halka Tatlısı'
      }
    ],
    tags: ['şerbetli', 'halka', 'çay saati'],
    tax_included: true,
    is_active: true,
    is_featured: false,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'p10',
    name: 'Şekerpare',
    slug: 'sekerpare',
    type: 'simple' as const,
    category_id: 'cat_serbetli_tatlilar',
    category_slug: 'serbetli-tatlilar',
    description: 'Yumuşak dokulu, şerbetiyle buluşmuş, üzerine ceviz serpilmiş klasik tatlı.',
    price: 190,
    price_from: 190,
    price_to: 190,
    is_variable: false,
    sku: 'SER-0002',
    stock_qty: 45,
    images: [
      {
        url: '/media/products/sekerpare-1.jpg',
        alt: 'Şekerpare'
      }
    ],
    tags: ['şerbetli', 'cevizli', 'klasik'],
    tax_included: true,
    is_active: true,
    is_featured: false,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  
  // Özel Lezzetler
  {
    id: 'p11',
    type: 'simple' as const,
    name: 'Lotuslu Tulumba',
    slug: 'lotuslu-tulumba',
    category_id: 'cat_ozel_lezzetler',
    description: 'Belçika\'nın ünlü bisküvisi Lotus ile harmanlanmış modern tulumba. Farklı lezzet arayanlar için.',
    sku: 'OZL-0001',
    price: 220,
    stock_mode: 'product' as const,
    stock_qty: 20,
    images: [
      {
        url: '/media/products/lotuslu-tulumba-1.jpg',
        alt: 'Lotuslu Tulumba'
      }
    ],
    tax_included: true,
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'p12',
    type: 'simple' as const,
    name: 'Karışık Dolgulu Tulumba',
    slug: 'karisik-dolgulu-tulumba',
    category_id: 'cat_ozel_lezzetler',
    description: 'İçine fıstık, ceviz, kaymak karışımı konulmuş zengin lezzetli tulumba. Tüm lezzetleri bir arada sevenler için.',
    sku: 'OZL-0002',
    price: 250,
    stock_mode: 'product' as const,
    stock_qty: 15,
    images: [
      {
        url: '/media/products/karisik-dolgulu-tulumba-1.jpg',
        alt: 'Karışık Dolgulu Tulumba'
      }
    ],
    tax_included: true,
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  }
];

// Helper functions
export function getMockProductsByCategory(categorySlug: string) {
  return mockProducts.filter(product => product.category_slug === categorySlug);
}

export function getMockProductBySlug(slug: string) {
  return mockProducts.find(product => product.slug === slug);
}

export function getMockFeaturedProducts(limit = 6) {
  return mockProducts
    .filter(product => product.is_featured)
    .slice(0, limit);
}

export function getMockCategoryBySlug(slug: string) {
  return mockCategories.find(category => category.slug === slug);
}

// Mock API responses
export const mockApiResponses = {
  categories: {
    success: true,
    data: mockCategories
  },
  products: {
    success: true,
    data: mockProducts,
    meta: {
      page: 1,
      per_page: 12,
      total: mockProducts.length
    }
  }
};