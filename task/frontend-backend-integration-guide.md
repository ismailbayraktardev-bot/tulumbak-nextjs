# Frontend - Backend Integration Guide

## Overview
This document provides comprehensive guidelines for integrating frontend components with the completed backend APIs. Backend implementation is 95% complete with 40+ working endpoints, full authentication system, payment integration, and delivery zone management.

## 🚀 Current Backend Status

### ✅ Completed Features
- **Authentication System**: JWT with refresh tokens, HTTP-only cookies
- **User Management**: Registration, login, profile management
- **Product Catalog**: Full CRUD with categories, search, filtering
- **Shopping Cart**: Guest cart support, 24-hour expiration, cart merging
- **Order Management**: Complete order lifecycle, status tracking
- **Payment Integration**: PayTR payment gateway with webhooks
- **Admin Dashboard**: Products, orders, categories, analytics APIs
- **Branch & Zone Management**: Location-based delivery assignment
- **Database Schema**: 9+ tables with proper relationships and constraints
- **Docker Environment**: Production-ready containerized setup

### 🌐 API Base URL
- **Development**: `http://localhost:3006`
- **Production**: `https://api.tulumbak.com` (when deployed)

## 🔐 Authentication Integration

### JWT Token Management
```typescript
// Required HTTP-only cookies for authentication
// These are automatically set by login/register endpoints
- access_token: JWT access token (15 minutes)
- refresh_token: JWT refresh token (7 days)
```

### API Client Setup
```typescript
// lib/api.ts - Base API client configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Include credentials for cookies
    const config = {
      ...options,
      credentials: 'include' as RequestCredentials,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    // Handle 401 unauthorized - token refresh logic
    if (response.status === 401) {
      // Trigger refresh token flow or redirect to login
      throw new Error('Authentication required');
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
```

### Authentication Flow
```typescript
// services/auth.ts
export const authService = {
  async login(email: string, password: string) {
    return apiClient.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(userData: RegisterData) {
    return apiClient.request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async logout() {
    return apiClient.request('/api/v1/auth/logout', {
      method: 'POST',
    });
  },

  async refreshToken() {
    return apiClient.request('/api/v1/auth/refresh', {
      method: 'POST',
    });
  },
};
```

## 🛒 Shopping Cart Integration

### Cart Data Structure
```typescript
interface CartItem {
  id: string;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  total_price: number;
}

interface Cart {
  id: string;
  items: CartItem[];
  total_amount: number;
  total_items: number;
  expires_at: string;
  user_id?: string;
}
```

### Cart Service Implementation
```typescript
// services/cart.ts
export const cartService = {
  async getCart() {
    return apiClient.request('/api/v1/cart');
  },

  async addToCart(productId: number, quantity: number) {
    return apiClient.request('/api/v1/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },

  async updateItemQuantity(itemId: string, quantity: number) {
    return apiClient.request(`/api/v1/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  async removeFromCart(itemId: string) {
    return apiClient.request(`/api/v1/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  async clearCart() {
    return apiClient.request('/api/v1/cart', {
      method: 'DELETE',
    });
  },
};
```

## 📦 Product Catalog Integration

### Product Data Structure
```typescript
interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category_id: number;
  category: {
    id: number;
    name: string;
  };
  image_url?: string;
  sku?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  parent_id?: number;
  is_active: boolean;
  children?: Category[];
}
```

### Product Service Implementation
```typescript
// services/products.ts
export const productService = {
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category_id?: number;
    search?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return apiClient.request(`/api/v1/products?${searchParams}`);
  },

  async getProduct(productId: number) {
    return apiClient.request(`/api/v1/products/${productId}`);
  },

  async getCategories() {
    return apiClient.request('/api/v1/categories');
  },

  async getCategoryProducts(categoryId: number, params?: any) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return apiClient.request(`/api/v1/categories/${categoryId}/products?${searchParams}`);
  },
};
```

## 📍 Delivery Zone Integration

### Zone Lookup Service
```typescript
// services/zones.ts
export interface ZoneLookupRequest {
  city: string;
  district: string;
  postal_code?: string;
  neighborhood?: string;
  address_line?: string;
}

export interface ZoneLookupResponse {
  zone: {
    id: number;
    name: string;
    delivery_fee: number;
    estimated_delivery_time: number;
    min_order_amount: number;
  };
  branch?: {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    working_hours: string;
  };
  address_validation: {
    city: string;
    district: string;
    postal_code?: string;
    neighborhood?: string;
    is_valid: boolean;
    match_type: 'exact' | 'postal_code' | 'city_only' | 'city_fallback';
  };
  service_info: {
    can_deliver: boolean;
    match_score: number;
    notes: string;
  };
  alternatives?: Array<{
    zone: {
      id: number;
      name: string;
      district: string;
      delivery_fee: number;
      estimated_delivery_time: number;
    };
    branch?: {
      name: string;
    };
  }>;
}

export const zoneService = {
  async lookupAddress(address: ZoneLookupRequest): Promise<ZoneLookupResponse> {
    return apiClient.request('/api/v1/zones/lookup', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  },

  async getAvailableCities() {
    return apiClient.request('/api/v1/zones/lookup');
  },

  async getDistrictsInCity(city: string) {
    return apiClient.request(`/api/v1/zones/lookup?city=${encodeURIComponent(city)}`);
  },
};
```

### Address Form Integration
```typescript
// components/forms/address-form.tsx
import { useState } from 'react';
import { zoneService } from '@/services/zones';

export const AddressForm = () => {
  const [address, setAddress] = useState({
    city: '',
    district: '',
    postal_code: '',
    neighborhood: '',
    address_line: '',
  });

  const [zoneInfo, setZoneInfo] = useState<ZoneLookupResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddressChange = async (field: string, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));

    // Auto-lookup zone when city and district are filled
    if (field === 'city' || field === 'district') {
      const newAddress = { ...address, [field]: value };

      if (newAddress.city && newAddress.district) {
        setLoading(true);
        try {
          const result = await zoneService.lookupAddress(newAddress);
          setZoneInfo(result);
        } catch (error) {
          console.error('Zone lookup failed:', error);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  return (
    <div className="address-form">
      {/* Form fields with auto zone lookup */}
    </div>
  );
};
```

## 💳 Payment Integration

### PayTR Payment Flow
```typescript
// services/payments.ts
export interface PaymentInitRequest {
  order_id: string;
  amount: number;
  currency?: string;
  callback_url?: string;
  success_url?: string;
  fail_url?: string;
}

export interface PaymentResponse {
  success: boolean;
  data?: {
    payment_url: string;
    token: string;
    merchant_oid: string;
    amount: number;
    currency: string;
    installments?: number[];
    payment_type: string;
    card_info?: {
      bank: string;
      card_type: string;
      bank_logo_url: string;
    };
  };
}

export const paymentService = {
  async initiatePayment(paymentData: PaymentInitRequest): Promise<PaymentResponse> {
    return apiClient.request('/api/v1/payments/paytr/init', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  async checkPaymentStatus(params: {
    order_id?: string;
    merchant_oid?: string;
    payment_id?: string;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });

    return apiClient.request(`/api/v1/payments/status?${searchParams}`);
  },

  async getPaymentDetails(paymentId: string) {
    return apiClient.request(`/api/v1/payments/${paymentId}`);
  },
};
```

### Payment Integration Component
```typescript
// components/payment/payment-container.tsx
import { useState } from 'react';
import { paymentService } from '@/services/payments';

export const PaymentContainer = ({ orderId, amount }: { orderId: string; amount: number }) => {
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const initiatePayment = async () => {
    setLoading(true);
    try {
      const response = await paymentService.initiatePayment({
        order_id: orderId,
        amount,
        success_url: `${window.location.origin}/payment/success`,
        fail_url: `${window.location.origin}/payment/fail`,
      });

      if (response.success && response.data?.payment_url) {
        // Redirect to PayTR payment page
        window.location.href = response.data.payment_url;
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <button
        onClick={initiatePayment}
        disabled={loading}
        className="payment-button"
      >
        {loading ? 'Processing...' : `Pay ₺${amount.toFixed(2)}`}
      </button>
    </div>
  );
};
```

## 📋 Order Management Integration

### Order Data Structure
```typescript
interface Order {
  id: string;
  user_id?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_fee: number;
  final_amount: number;
  items: OrderItem[];
  delivery_address: Address;
  payment_method: 'online' | 'cod' | 'transfer';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  zone_id?: number;
  branch_id?: number;
  estimated_delivery?: string;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}
```

### Order Service Implementation
```typescript
// services/orders.ts
export const orderService = {
  async createOrder(orderData: {
    items: Array<{
      product_id: number;
      quantity: number;
    }>;
    delivery_address: {
      city: string;
      district: string;
      neighborhood: string;
      address_line: string;
      postal_code: string;
      recipient_name: string;
      phone: string;
    };
    payment_method: 'online' | 'cod' | 'transfer';
    notes?: string;
  }) {
    return apiClient.request('/api/v1/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async getUserOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return apiClient.request(`/api/v1/orders?${searchParams}`);
  },

  async getOrder(orderId: string) {
    return apiClient.request(`/api/v1/orders/${orderId}`);
  },

  async updateOrderStatus(orderId: string, status: string, note?: string) {
    return apiClient.request(`/api/v1/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note }),
    });
  },
};
```

## 🎨 Mock Data Replacement Strategy

### Step-by-Step Migration
1. **Start with Authentication**: Replace mock auth with real JWT flow
2. **Product Catalog**: Switch from mock products to API calls
3. **Shopping Cart**: Implement real cart management
4. **Order Flow**: Connect checkout to real order creation
5. **Payment Integration**: Add PayTR payment flow
6. **Admin Dashboard**: Connect admin components to management APIs

### Environment Variables
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3006
NEXT_PUBLIC_STORE_URL=http://localhost:3001
NEXT_PUBLIC_ADMIN_URL=http://localhost:3002

# Payment callbacks (for development)
NEXT_PUBLIC_PAYMENT_SUCCESS_URL=http://localhost:3001/payment/success
NEXT_PUBLIC_PAYMENT_FAIL_URL=http://localhost:3001/payment/fail
```

## 🔧 Error Handling & User Experience

### Global Error Handler
```typescript
// utils/error-handler.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error instanceof ApiError) return error;

  if (error.status === 401) {
    return new ApiError('Please login to continue', 401, 'AUTH_REQUIRED');
  }

  if (error.status === 403) {
    return new ApiError('Access denied', 403, 'ACCESS_DENIED');
  }

  if (error.status === 404) {
    return new ApiError('Resource not found', 404, 'NOT_FOUND');
  }

  return new ApiError('Something went wrong', 500, 'INTERNAL_ERROR');
};
```

### Loading States & UX
```typescript
// hooks/use-api-loading.ts
import { useState } from 'react';

export const useApiLoading = <T>(
  apiCall: () => Promise<T>
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};
```

## 📱 Responsive Design Considerations

### Mobile-First API Integration
- Use appropriate page sizes for mobile (10-20 items per page)
- Implement infinite scroll for large datasets
- Optimize images for mobile bandwidth
- Consider offline-first approach for critical features

### Performance Optimization
```typescript
// utils/api-cache.ts
const apiCache = new Map<string, { data: any; timestamp: number }>();

export const cachedApiCall = async (
  key: string,
  apiCall: () => Promise<any>,
  ttl = 5 * 60 * 1000 // 5 minutes
) => {
  const cached = apiCache.get(key);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < ttl) {
    return cached.data;
  }

  const data = await apiCall();
  apiCache.set(key, { data, timestamp: now });

  return data;
};
```

## 🧪 Testing Integration

### Mock API for Development
```typescript
// __tests__/mocks/api.ts
export const mockApiClient = {
  request: async (endpoint: string, options?: RequestInit) => {
    // Return mock responses based on endpoint
    if (endpoint.includes('/products')) {
      return mockProductsResponse;
    }
    // Add more mock responses...
  },
};
```

### Integration Tests
```typescript
// __tests__/integration/cart.test.ts
import { renderHook, act } from '@testing-library/react';
import { useApiLoading } from '@/hooks/use-api-loading';
import { cartService } from '@/services/cart';

test('should add item to cart', async () => {
  const { result } = renderHook(() =>
    useApiLoading(() => cartService.addToCart(1, 2))
  );

  await act(async () => {
    await result.current.execute();
  });

  expect(result.current.data).toBeDefined();
  expect(result.current.error).toBeNull();
});
```

## 🚨 Important Notes

### Turkish Character Support
- Backend supports UTF-8 for Turkish characters (İ, ş, ğ, etc.)
- Ensure proper encoding in frontend API calls
- Test with real Turkish addresses and product names

### CORS Configuration
- Backend is configured for CORS with allowed origins
- Update CORS settings in production environment
- Include credentials for cookie-based authentication

### Rate Limiting
- Public APIs have rate limiting implemented
- Implement proper retry logic for rate-limited requests
- Show user-friendly messages for rate limits

### Security
- Never store sensitive data in frontend
- Use HTTPS in production
- Validate all user inputs on both client and server side
- Implement proper CSRF protection

## 📞 Support & Troubleshooting

### Common Issues
1. **CORS Errors**: Check API base URL configuration
2. **Authentication Issues**: Verify cookie settings and domain
3. **Encoding Issues**: Ensure UTF-8 support for Turkish characters
4. **Payment Issues**: Verify PayTR configuration and callback URLs

### Debug Mode
```typescript
// Enable debug logging
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled API Error:', event.reason);
  });
}
```

---

## 🎯 Next Steps

1. **Implement Authentication Flow**: Start with login/register pages
2. **Replace Mock Data**: Gradually replace mock data with API calls
3. **Add Error Handling**: Implement proper error boundaries
4. **Performance Testing**: Test with real data volumes
5. **User Testing**: Get feedback on real API integration

For questions or issues, refer to the API documentation at `/api/docs` or contact the backend development team.