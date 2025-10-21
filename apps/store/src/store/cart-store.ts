import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProductSummary, Cart, CartItem } from '@/lib/types';

// Extended cart item with product info for UI
export interface CartItemWithProduct extends CartItem {
  name: string;
  slug: string;
  image?: string;
  stock: number;
}

// Mock data for development - Use fixed dates to prevent hydration issues
const mockCartItems: CartItemWithProduct[] = [
  {
    id: 'ci_1',
    cart_id: 'guest_cart_1',
    product_id: 'prod_1',
    variant: { weight: 1000 },
    quantity: 2,
    unit_price: 450.00,
    total_price: 900.00,
    name: 'Fıstıklı Baklava',
    slug: 'fistikli-baklava',
    image: '/media/product-img/baklava.png',
    stock: 15,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'ci_2',
    cart_id: 'guest_cart_1',
    product_id: 'prod_2',
    variant: { serving: 6 },
    quantity: 1,
    unit_price: 280.00,
    total_price: 280.00,
    name: 'Tulumba',
    slug: 'tulumba',
    image: '/media/product-img/tulumba.png',
    stock: 8,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  }
];

// Types
export interface CartState {
  // Cart data
  cart: Cart | null;
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  
  // User context
  isAuthenticated: boolean;
  userId: string | null;
  
  // Cache for totals to prevent infinite loops
  _cachedTotals?: { subtotal: number; tax: number; total: number };
  _cachedSubtotal?: number;
  
  // Actions
  addItem: (product: ProductSummary, quantity?: number, variant?: Record<string, any>) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Sync actions
  syncWithBackend: () => Promise<void>;
  mergeGuestCart: (userId: string) => Promise<void>;
  
  // Utility actions
  calculateTotals: () => { subtotal: number; tax: number; total: number };
  getItemCount: () => number;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Initial cart state
const initialState: Omit<CartState, 'addItem' | 'removeItem' | 'updateQuantity' | 'clearCart' | 'syncWithBackend' | 'mergeGuestCart' | 'calculateTotals' | 'getItemCount' | 'setIsLoading' | 'setError'> = {
  cart: null,
  items: process.env.NODE_ENV === 'development' ? mockCartItems : [],
  isLoading: false,
  error: null,
  isAuthenticated: false,
  userId: null,
};

// Cart store implementation
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Add item to cart
      addItem: async (product: ProductSummary, quantity = 1, variant = {}) => {
        const state = get();
        
        try {
          set({ isLoading: true, error: null });

          const existingItemIndex = state.items.findIndex(
            item => 
              item.product_id === product.id && 
              JSON.stringify(item.variant) === JSON.stringify(variant)
          );

          let updatedItems: CartItem[];

          if (existingItemIndex >= 0) {
            // Update existing item
            updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + quantity,
              updated_at: new Date().toISOString(),
            };
          } else {
            // Add new item
            // Use a more stable ID generation to prevent hydration issues
            const timestamp = typeof window !== 'undefined' ? Date.now() : 0;
            const randomStr = Math.random().toString(36).substr(2, 9);
            
            const newItem: CartItem = {
              id: `ci_${timestamp}_${randomStr}`,
              cart_id: state.cart?.id || `guest_${timestamp}`,
              product_id: product.id,
              variant,
              quantity,
              unit_price: product.price_from || 0,
              total_price: (product.price_from || 0) * quantity,
              created_at: new Date(timestamp).toISOString(),
              updated_at: new Date(timestamp).toISOString(),
            };
            updatedItems = [...state.items, newItem];
          }

          set({ items: updatedItems });

          // Sync with backend if authenticated or cart exists
          if (state.isAuthenticated || state.cart?.id) {
            await syncCartWithBackend(updatedItems, state.cart?.id);
          }

        } catch (error) {
          console.error('Failed to add item to cart:', error);
          set({ error: 'Ürün sepete eklenirken bir hata oluştu.' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Remove item from cart
      removeItem: async (itemId: string) => {
        const state = get();
        
        try {
          set({ isLoading: true, error: null });

          const updatedItems = state.items.filter(item => item.id !== itemId);
          set({ items: updatedItems });

          // Sync with backend
          if (state.isAuthenticated || state.cart?.id) {
            await syncCartWithBackend(updatedItems, state.cart?.id);
          }

        } catch (error) {
          console.error('Failed to remove item from cart:', error);
          set({ error: 'Ürün sepetten kaldırılırken bir hata oluştu.' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Update item quantity
      updateQuantity: async (itemId: string, quantity: number) => {
        const state = get();
        
        if (quantity <= 0) {
          return state.removeItem(itemId);
        }

        try {
          set({ isLoading: true, error: null });

          const updatedItems = state.items.map(item => 
            item.id === itemId 
              ? {
                  ...item,
                  quantity,
                  total_price: item.unit_price * quantity,
                  updated_at: new Date().toISOString(),
                }
              : item
          );

          set({ items: updatedItems });

          // Sync with backend
          if (state.isAuthenticated || state.cart?.id) {
            await syncCartWithBackend(updatedItems, state.cart?.id);
          }

        } catch (error) {
          console.error('Failed to update item quantity:', error);
          set({ error: 'Ürün miktarı güncellenirken bir hata oluştu.' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Clear cart
      clearCart: async () => {
        const state = get();
        
        try {
          set({ isLoading: true, error: null });
          set({ items: [], cart: null });

          // Clear backend cart if exists
          if (state.cart?.id && state.isAuthenticated) {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/carts/${state.cart.id}`, {
              method: 'DELETE',
              credentials: 'include',
            });
          }

        } catch (error) {
          console.error('Failed to clear cart:', error);
          set({ error: 'Sepet temizlenirken bir hata oluştu.' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Sync with backend
      syncWithBackend: async () => {
        const state = get();
        
        if (!state.isAuthenticated && !state.cart?.id) {
          return;
        }

        try {
          set({ isLoading: true, error: null });

          const cartId = state.cart?.id || `guest_${typeof window !== 'undefined' ? Date.now() : 0}`;
          await syncCartWithBackend(state.items, cartId);

        } catch (error) {
          console.error('Failed to sync cart with backend:', error);
          set({ error: 'Sepet senkronize edilirken bir hata oluştu.' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Merge guest cart with user cart
      mergeGuestCart: async (userId: string) => {
        const state = get();
        
        if (state.items.length === 0) {
          return;
        }

        try {
          set({ isLoading: true, error: null });

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/carts/merge`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              guest_items: state.items,
              user_id: userId,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to merge cart');
          }

          const mergedCart = await response.json();
          set({ 
            cart: mergedCart, 
            items: mergedCart.items || [],
            isAuthenticated: true,
            userId,
          });

        } catch (error) {
          console.error('Failed to merge guest cart:', error);
          set({ error: 'Sepet birleştirilirken bir hata oluştu.' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Calculate totals
      calculateTotals: () => {
        const state = get();
        const subtotal = state.items.reduce((total, item) => total + item.total_price, 0);
        const tax = subtotal * 0.18; // 18% KDV
        const total = subtotal + tax;

        // Return cached object to prevent infinite loops
        if (!state._cachedTotals || state._cachedSubtotal !== subtotal) {
          state._cachedTotals = { subtotal, tax, total };
          state._cachedSubtotal = subtotal;
        }
        return state._cachedTotals;
      },

      // Get item count
      getItemCount: () => {
        const state = get();
        return state.items.reduce((count, item) => count + item.quantity, 0);
      },

      // Set loading state
      setIsLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Set error
      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'tulumbak-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        cart: state.cart,
        isAuthenticated: state.isAuthenticated,
        userId: state.userId,
      }),
    }
  )
);

// Helper function to sync cart with backend (with mock fallback)
async function syncCartWithBackend(items: CartItem[], cartId?: string) {
  // Development mode: use mock sync
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Development mode: Mock cart sync', { items: items.length, cartId });
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: cartId || `guest_${typeof window !== 'undefined' ? Date.now() : 0}`,
      items,
      updated_at: new Date().toISOString(),
    };
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/carts/${cartId || 'guest'}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      items: items.map(item => ({
        product_id: item.product_id,
        variant: item.variant,
        quantity: item.quantity,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to sync cart');
  }

  return response.json();
}

// Selectors for common use - Use individual selectors to prevent infinite loops
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartTotals = () => {
  const items = useCartStore((state) => state.items)
  const calculateTotals = useCartStore((state) => state.calculateTotals)
  
  // Calculate totals directly to avoid infinite loops
  const subtotal = items.reduce((total, item) => total + item.total_price, 0);
  const tax = subtotal * 0.18; // 18% KDV
  const total = subtotal + tax;
  
  return { subtotal, tax, total };
}
export const useCartItemCount = () => {
  const items = useCartStore((state) => state.items)
  return items.reduce((count, item) => count + item.quantity, 0)
}
export const useCartLoading = () => useCartStore((state) => state.isLoading);
export const useCartError = () => useCartStore((state) => state.error);
export const useCartActions = () => {
  const addItem = useCartStore((state) => state.addItem)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const syncWithBackend = useCartStore((state) => state.syncWithBackend)
  const mergeGuestCart = useCartStore((state) => state.mergeGuestCart)
  
  return {
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    syncWithBackend,
    mergeGuestCart,
  }
}
