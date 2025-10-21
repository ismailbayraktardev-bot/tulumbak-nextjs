/**
 * Mock data for frontend development
 * Used when backend API is not available
 */

import { Product, Review, RecentlyViewedProduct } from '@/types/product';

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
    slug: 'klasik-tulumba-tatlisi',
    name: 'Klasik Tulumba Tatlısı',
    description: 'Geleneksel tarifle hazırlanmış, altın renginde, çıtır tulumba tatlısı. Şerbetiyle buluştuğunda damaklarda unutulmaz bir lezzet bırakır.',
    price: 120.00,
    originalPrice: 150.00,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBypMzuBlCfJq8TEFU0t_M4UrVPOuWMpDaZNouZuyqXC4EA6LdHewsaUMyQOUevzocRYg8LTWGJCBl8rG2zvQoDczooM026kKgQoV69l_jUAkTWD1yTXEowAHTqx8Di1y4L3XtVyz1lr9b1GWIPwQFsNrQRun-OwoUiK-xdv45dAblcZSxsJo54UfV14y3XCufRP3NglLAIZE04T09QwcNVi0oMU_OVONKI0TY_PQtI0f0zeCbz9xRFFbjgWgblJt0AaJ-z-2aag0I',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCEuy7_60nGuc9ZWuOeiFAMGyg2fRY_ZJGf1BjavV7Rl8II4D91yMGxcod7cOTVjlPG5J_4rYScIDedDKSLffSta1MIGiYj_85KlHYnUs0Xxj6AQgkThTk21XEDAy6RYEX8yw-BTC0SemvmnAyYfeAj4P3lrr6duGGWAg_taIfxC8obRczLKgUgaXHP9xYS2a5F7rRJg044BHC_vdmEOMXOQ9L4KjpyYnLYpw1L32kVDMrVghMXLKZOO0u5q3z6CEiwS5FxwwljF84',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDIA3GCbjmoegKG6Yyo2Vg0QvMXgJ3KNK0BXmW9V0H6FmL7XM_Aj5ZsHw4JN1JncDU0NaNLpvQxOsl7lwsWOYMv8DAoTsohitMPL8rNa9pfaf4RXbWmhYz9Yqu5O8mf2DvUWUzKUrodWJQ8A30opXfn5TdUt10PLzr3aetmVBMoQRrdLy8tcmazFDEzgryAKTabAiOLjs0itWviuaApHKDdlXX_dlfssTJx_1xoZA-EGeOITMKM-W6R1vT6a9ZJLkRh3OeKziqvc50',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBO13ru1kk6xOht4jfvMreMwnuqF7eX_G2QhXyA37H_vlKPmfU3t5-eCOYYWqU1V5c-O8-eachHJZjuw_5aq91EUdwOnmxsUwPQ4nzN6mMBld2OeC-35N4aKbYlXMcbwnpMGYsiJHi7Tjyv5zQmFGtUBWsfuww8fIMZaxrDY9rWMbVYXUiQKE-7fSXnc5gubbzrJ-E7C5RDplNE1SL_WqSDmZ0-xak-wHGbOqGJ_JflgWWH2DvjfOu4ywNZeC9xovSk_VKO1CkA2l0',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAu3hNyYqvZh1FqG4M68s4ai7aMm_ndESDMa6zrxllc0DqHVeOpbEv7QYPeZHdy9-D03H6LXnsurZk-EO5lFn1driELuYMIGOugkS7Jxbt5fwtbiX9FB85W8XKZ8ruPQn51YiQcbbaxi1ucMRDJ_xUMBAPFdRH0c9dbRzKSvaGdSuUcvwPPOiUTRfP1fwbvL1X_qQ3zAS1Zlr96xVMrBzYUFc5jJcbRUGQa5agl4XTFAahzIyCph2B9v1m6lAY2wyqVTAe7k2nUw1M'
    ],
    rating: 4.5,
    reviewCount: 12,
    weightOptions: [
      {
        id: 'weight_1',
        label: '0.5 KG (13-15 Adet Kutuda)',
        price: 120.00,
        stock: 50
      },
      {
        id: 'weight_2',
        label: '1 KG (27-30 Adet Kutuda)',
        price: 220.00,
        stock: 30
      }
    ],
    inStock: true,
    category: {
      id: 'cat_tulumbalar',
      name: 'Tulumbalar',
      slug: 'tulumbalar'
    },
    tags: ['geleneksel', 'şerbetli', 'çıtır'],
    ingredients: ['Buğday unu', 'Şeker', 'Su', 'Pisirme yağı'],
    allergens: ['Gluten'],
    deliveryInfo: {
      standardDelivery: '2-3 iş günü içerisinde teslimat.',
      expressDelivery: 'Aynı gün teslimat (sadece belirli bölgeler için geçerlidir).'
    },
    seo: {
      title: 'Klasik Tulumba Tatlısı | Tulumbak',
      description: 'Geleneksel tarifle hazırlanmış, altın renginde, çıtır tulumba tatlısı.',
      keywords: 'tulumba, tatlı, şerbetli, geleneksel'
    },
    createdAt: '2025-10-21T10:00:00Z',
    updatedAt: '2025-10-21T15:30:00Z'
  },
  // Fıstıklı Baklava
  {
    id: 'p2',
    slug: 'fistikli-baklava',
    name: 'Fıstıklı Baklava',
    description: 'Katmanlı hamur ve fıstık ile hazırlanan geleneksel Türk tatlısı. Özel şerbetiyle buluştuğunda damaklarda unutulmaz bir lezzet bırakır.',
    price: 450.00,
    originalPrice: 550.00,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBypMzuBlCfJq8TEFU0t_M4UrVPOuWMpDaZNouZuyqXC4EA6LdHewsaUMyQOUevzocRYg8LTWGJCBl8rG2zvQoDczooM026kKgQoV69l_jUAkTWD1yTXEowAHTqx8Di1y4L3XtVyz1lr9b1GWIPwQFsNrQRun-OwoUiK-xdv45dAblcZSxsJo54UfV14y3XCufRP3NglLAIZE04T09QwcNVi0oMU_OVONKI0TY_PQtI0f0zeCbz9xRFFbjgWgblJt0AaJ-z-2aag0I',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCEuy7_60nGuc9ZWuOeiFAMGyg2fRY_ZJGf1BjavV7Rl8II4D91yMGxcod7cOTVjlPG5J_4rYScIDedDKSLffSta1MIGiYj_85KlHYnUs0Xxj6AQgkThTk21XEDAy6RYEX8yw-BTC0SemvmnAyYfeAj4P3lrr6duGGWAg_taIfxC8obRczLKgUgaXHP9xYS2a5F7rRJg044BHC_vdmEOMXOQ9L4KjpyYnLYpw1L32kVDMrVghMXLKZOO0u5q3z6CEiwS5FxwwljF84',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDIA3GCbjmoegKG6Yyo2Vg0QvMXgJ3KNK0BXmW9V0H6FmL7XM_Aj5ZsHw4JN1JncDU0NaNLpvQxOsl7lwsWOYMv8DAoTsohitMPL8rNa9pfaf4RXbWmhYz9Yqu5O8mf2DvUWUzKUrodWJQ8A30opXfn5TdUt10PLzr3aetmVBMoQRrdLy8tcmazFDEzgryAKTabAiOLjs0itWviuaApHKDdlXX_dlfssTJx_1xoZA-EGeOITMKM-W6R1vT6a9ZJLkRh3OeKziqvc50',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBO13ru1kk6xOht4jfvMreMwnuqF7eX_G2QhXyA37H_vlKPmfU3t5-eCOYYWqU1V5c-O8-eachHJZjuw_5aq91EUdwOnmxsUwPQ4nzN6mMBld2OeC-35N4aKbYlXMcbwnpMGYsiJHi7Tjyv5zQmFGtUBWsfuww8fIMZaxrDY9rWMbVYXUiQKE-7fSXnc5gubbzrJ-E7C5RDplNE1SL_WqSDmZ0-xak-wHGbOqGJ_JflgWWH2DvjfOu4ywNZeC9xovSk_VKO1CkA2l0',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAu3hNyYqvZh1FqG4M68s4ai7aMm_ndESDMa6zrxllc0DqHVeOpbEv7QYPeZHdy9-D03H6LXnsurZk-EO5lFn1driELuYMIGOugkS7Jxbt5fwtbiX9FB85W8XKZ8ruPQn51YiQcbbaxi1ucMRDJ_xUMBAPFdRH0c9dbRzKSvaGdSuUcvwPPOiUTRfP1fwbvL1X_qQ3zAS1Zlr96xVMrBzYUFc5jJcbRUGQa5agl4XTFAahzIyCph2B9v1m6lAY2wyqVTAe7k2nUw1M'
    ],
    rating: 4.8,
    reviewCount: 24,
    weightOptions: [
      {
        id: 'weight_1',
        label: '0.5 KG (13-15 Adet Kutuda)',
        price: 250.00,
        stock: 40
      },
      {
        id: 'weight_2',
        label: '1 KG (27-30 Adet Kutuda)',
        price: 450.00,
        stock: 30
      },
      {
        id: 'weight_3',
        label: '2 KG (55-57 Adet Tepside)',
        price: 850.00,
        stock: 20
      },
      {
        id: 'weight_4',
        label: '3 KG (80-85 Adet Tepside)',
        price: 1200.00,
        stock: 15
      }
    ],
    inStock: true,
    category: {
      id: 'cat_baklavalar',
      name: 'Baklavalar',
      slug: 'baklavalar'
    },
    tags: ['fıstıklı', 'geleneksel', 'şerbetli'],
    ingredients: ['Buğday unu', 'Antep fıstığı', 'Tereyağı', 'Şeker', 'Su'],
    allergens: ['Gluten', 'Fındık'],
    deliveryInfo: {
      standardDelivery: '2-3 iş günü içerisinde teslimat.',
      expressDelivery: 'Aynı gün teslimat (sadece İzmir için geçerlidir).'
    },
    seo: {
      title: 'Fıstıklı Baklava | Tulumbak',
      description: 'Katmanlı hamur ve fıstık ile hazırlanan geleneksel Türk tatlısı.',
      keywords: 'baklava, fıstıklı, tatlı, geleneksel'
    },
    createdAt: '2025-10-21T10:00:00Z',
    updatedAt: '2025-10-21T15:30:00Z'
  }
];

// Mock reviews data
export const mockReviews: Review[] = [
  {
    id: 'review_1',
    rating: 5,
    title: 'Harika bir lezzet!',
    content: 'Yaptığım en iyi baklava alışverişiydi. Taze ve lezzetli, paketleme de özenliydi. Kesinlikle tavsiye ederim.',
    reviewer: {
      name: 'Ayşe Y.',
      avatar: 'https://lh3.googleusercontent.com/a/default-user'
    },
    date: '2025-10-15T14:30:00Z',
    verified: true,
    helpful: 12
  },
  {
    id: 'review_2',
    rating: 4,
    title: 'Çok iyi, biraz tatlı',
    content: 'Fıstıkların kalitesi harika, hamur da mükemmel. Şerbet benim için biraz tatlıydı ama ailem çok sevdi. Yine de çok kaliteli bir ürün.',
    reviewer: {
      name: 'Mehmet K.',
      avatar: 'https://lh3.googleusercontent.com/a/default-user'
    },
    date: '2025-10-12T10:15:00Z',
    verified: true,
    helpful: 8
  },
  {
    id: 'review_3',
    rating: 5,
    title: 'Mükemmel ürün',
    content: 'Gerçekten çok lezzetli ve taze. Misafirlerime ikram ettiğimde çok beğendiler. Teşekkürler Tulumbak!',
    reviewer: {
      name: 'Zeynep A.',
      avatar: 'https://lh3.googleusercontent.com/a/default-user'
    },
    date: '2025-10-10T16:45:00Z',
    verified: false,
    helpful: 5
  }
];

// Mock recently viewed products
export const mockRecentlyViewed: RecentlyViewedProduct[] = [
  {
    id: 'prod_2',
    slug: 'cevizli-sultan-rotasi',
    name: 'Cevizli Sultan Rotası',
    price: 380.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUluRvyNKeDYPSl0zjhnCZw7Dt8aWAuE4C7NE_nWT5jWzcldo-8ZHD_gipYW9y4aZx2wJgJjlZ0jZWc29PupWvw9RQKUvvNMUlZIMBSFvl1RzZrZ9S77W8ta0iok9hRojOgs__OMs2M6XiO8AAgc8T_NOygGMtYCiucW0B2rMUFOwuGuyljHdossIrqB3jMJ7hQXZHVbx2KM7kStAojXmGlR0SAXmjsER5-ORG20GNEKyL4Ji7ntWHJD8-8Hq7YbUJLhTB6SgtrSM',
    category: {
      name: 'Sultan Rotası'
    }
  },
  {
    id: 'prod_3',
    slug: 'klasik-turk-lokumu',
    name: 'Klasik Türk Lokumu',
    price: 220.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAZQDcfPC8-mXnA-PirTkGtplVXhBXvn9nWI0vNV4wCQcODqz8WfAfRlA15H9gRcYU4-UJdtbpokLzM6iKuE8o8MxdifiMrTUzDkjYgc-ttC_cX2kAm5lYhxx6HSsFF-NV-R-KvT37VPV8ok4Fn9di3RD-eUu0Au7VX0rOT8UDHAft-5euvLp30zTJNV29TjGJpbv3jRUXG7ixeO9_9nw9q2DabU7ZbMIlNuivsXKPJzJpgCQ6jc_ZdPyptnRM0lAFdXKqijLzTQM',
    category: {
      name: 'Türk Lokumu'
    }
  },
  {
    id: 'prod_4',
    slug: 'cikolatali-helva',
    name: 'Çikolatalı Helva',
    price: 280.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbqgZzAwXsX0XC40WTcnpk1NyLx4xI9eZe5XBkrxDIKpAiH8EAJX8SVTFN4C2NtVC0Z93B6QxvPFxsgzNqC7RF6j8KieEa1hGTl9_H7LJFfQUyyEsOWGsrDu-cXjaNUkKQqoDD8abCeF7BpKYeB6VlXWCOcTWbnAb3pH4sX55GTbARaE7PJgJETfNIIABd_7XrJ8hnGce-2ArWabfA6Mv4X2ofZ8sbHOMKBLvXonHAkEql-VguOEfePrCak_ObgLW3JWWAoNdKGbc',
    category: {
      name: 'Helva'
    }
  },
  {
    id: 'prod_5',
    slug: 'fistikli-katmer',
    name: 'Fıstıklı Katmer',
    price: 320.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBvY_rmB3G1HAvNuaSHP_KaRikS2nFFA-6m1c9xFlrYb1nKtv2h8-glSSaZpPnz1zW4Wqr2LUpu62JLlSQ3Sf5eolwK_1Mmh5lU0CHzfAcTTAYUjVOooDyrRsraS1XB9aSlsRE_ZJpEUCoyCMcWUbEeNgHbfU9Yb_00-HyGAHmfHAO7J8fhak50VzLXDK4kF7eFWtAc4Yclt2uZZ65_HHnXswftSiyEWf3uIYWZtGgy1TWH4Ti_SUgvry1YhrLl3i609BI5goUwJ0',
    category: {
      name: 'Katmer'
    }
  }
];

// Helper functions
export function getMockProductsByCategory(categorySlug: string) {
  return mockProducts.filter(product => product.category.slug === categorySlug);
}

export function getMockProductBySlug(slug: string) {
  return mockProducts.find(product => product.slug === slug);
}

export function getMockFeaturedProducts(limit = 6) {
  return mockProducts
    .filter(product => product.rating >= 4.5)
    .slice(0, limit);
}

export function getMockCategoryBySlug(slug: string) {
  return mockCategories.find(category => category.slug === slug);
}

export function getMockProductReviews(slug: string): Review[] {
  return mockReviews;
}

export function getMockRecentlyViewed(): RecentlyViewedProduct[] {
  return mockRecentlyViewed;
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