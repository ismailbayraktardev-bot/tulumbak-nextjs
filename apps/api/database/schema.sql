-- Tulumbak E-commerce Database Schema
-- Categories and Products Tables

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('simple', 'variable')) DEFAULT 'simple',
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  description TEXT,
  sku TEXT UNIQUE CHECK (sku ~ '^[A-Z0-9-]{3,32}$'),
  price NUMERIC(12,2) CHECK (price >= 0),
  stock_mode TEXT NOT NULL CHECK (stock_mode IN ('product', 'variant')) DEFAULT 'product',
  stock_qty INTEGER CHECK (stock_qty >= 0),
  images JSONB,
  tax_included BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('turkish', name || ' ' || COALESCE(description, '')));

-- Trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Categories: Anyone can read active categories
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (is_active = true);

-- Products: Anyone can read active products
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (is_active = true);

-- Users Table (for authentication)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'admin', 'super_admin')) DEFAULT 'customer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cart System Tables
CREATE TABLE IF NOT EXISTS carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'abandoned', 'converted')) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id UUID, -- Will be used when product variants are implemented
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(12,2) NOT NULL CHECK (total_price >= 0),
  attributes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cart_id, product_id, variant_id)
);

-- Orders Table (Sprint 4)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_no TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  cart_id UUID REFERENCES carts(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'on_delivery', 'delivered', 'cancelled', 'failed')) DEFAULT 'pending',
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  billing_type TEXT NOT NULL CHECK (billing_type IN ('individual', 'corporate')) DEFAULT 'individual',
  billing_tax_number TEXT,
  billing_company TEXT,
  shipping_address JSONB NOT NULL,
  delivery_slot JSONB,
  branch_id UUID, -- Will reference branches when implemented
  subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
  tax_total NUMERIC(12,2) NOT NULL CHECK (tax_total >= 0),
  shipping_total NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (shipping_total >= 0),
  grand_total NUMERIC(12,2) NOT NULL CHECK (grand_total >= 0),
  payment_provider TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_ref TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Status History Table
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for users and cart system
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id);
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_status ON carts(status);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);

-- Apply triggers for users and cart tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for new tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (id = current_setting('app.current_user_id')::uuid);
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (current_setting('app.current_user_role') = 'admin' OR current_setting('app.current_user_role') = 'super_admin');

-- RLS Policies for Carts
CREATE POLICY "Users can view own carts" ON carts FOR SELECT USING (user_id = current_setting('app.current_user_id')::uuid OR session_id = current_setting('app.current_session_id'));
CREATE POLICY "Users can create own carts" ON carts FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id')::uuid OR session_id = current_setting('app.current_session_id'));
CREATE POLICY "Users can update own carts" ON carts FOR UPDATE USING (user_id = current_setting('app.current_user_id')::uuid OR session_id = current_setting('app.current_session_id'));

-- RLS Policies for Cart Items
CREATE POLICY "Users can view own cart items" ON cart_items FOR SELECT USING (
  cart_id IN (SELECT id FROM carts WHERE user_id = current_setting('app.current_user_id')::uuid OR session_id = current_setting('app.current_session_id'))
);
CREATE POLICY "Users can manage own cart items" ON cart_items FOR ALL USING (
  cart_id IN (SELECT id FROM carts WHERE user_id = current_setting('app.current_user_id')::uuid OR session_id = current_setting('app.current_session_id'))
);

-- RLS Policies for Orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (user_id = current_setting('app.current_user_id')::uuid);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (current_setting('app.current_user_role') = 'admin' OR current_setting('app.current_user_role') = 'super_admin');

-- Admin policies (will be implemented with authentication)
-- For now, allow all inserts/updates/deletes (will be restricted later)
CREATE POLICY "Allow all to categories" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all to products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all to users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all to carts" ON carts FOR ALL USING (true);
CREATE POLICY "Allow all to cart_items" ON cart_items FOR ALL USING (true);
CREATE POLICY "Allow all to orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all to order_status_history" ON order_status_history FOR ALL USING (true);