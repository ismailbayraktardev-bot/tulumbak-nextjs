export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  weightOptions: WeightOption[];
  inStock: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  ingredients: string[];
  allergens: string[];
  deliveryInfo: {
    standardDelivery: string;
    expressDelivery: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WeightOption {
  id: string;
  label: string;
  price: number;
  stock: number;
}

export interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  reviewer: {
    name: string;
    avatar?: string;
  };
  date: string;
  verified: boolean;
  helpful: number;
}

export interface ProductTabs {
  description: string;
  ingredients: string[];
  allergens: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    serving: string;
  };
}

export interface ReviewForm {
  rating: number;
  title: string;
  content: string;
  reviewerName: string;
}

export interface RecentlyViewedProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: {
    name: string;
  };
}