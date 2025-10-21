import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Public Supabase client (for client-side operations)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// Service role client (for server-side admin operations)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper function to get service role client
export function getSupabaseAdmin() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  return supabaseAdmin
}

// Database table types
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          parent_id: string | null
          position: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          parent_id?: string | null
          position?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          parent_id?: string | null
          position?: number
          is_active?: boolean
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          type: 'simple' | 'variable'
          name: string
          slug: string
          category_id: string
          description: string | null
          sku: string
          price: number | null
          stock_mode: 'product' | 'variant'
          stock_qty: number | null
          images: any[] | null
          tax_included: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type?: 'simple' | 'variable'
          name: string
          slug: string
          category_id: string
          description?: string | null
          sku?: string
          price?: number | null
          stock_mode?: 'product' | 'variant'
          stock_qty?: number | null
          images?: any[] | null
          tax_included?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'simple' | 'variable'
          name?: string
          slug?: string
          category_id?: string
          description?: string | null
          sku?: string
          price?: number | null
          stock_mode?: 'product' | 'variant'
          stock_qty?: number | null
          images?: any[] | null
          tax_included?: boolean
          is_active?: boolean
          updated_at?: string
        }
      }
    }
  }
}