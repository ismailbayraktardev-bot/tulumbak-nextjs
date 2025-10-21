-- Tulumbak Database Initialization Script
-- This script is executed when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
-- CREATE EXTENSION IF NOT EXISTS "postgis"; -- Uncomment if using PostGIS

-- Create enum types
CREATE TYPE order_status AS ENUM ('pending','confirmed','preparing','ready','on_delivery','delivered','cancelled','failed');
CREATE TYPE product_type AS ENUM ('simple','variable');
CREATE TYPE stock_mode AS ENUM ('product','variant');
CREATE TYPE variant_kind AS ENUM ('weight','serving');
CREATE TYPE billing_type AS ENUM ('individual','corporate');
CREATE TYPE delivery_status AS ENUM ('pending','assigned','picked','on_the_way','delivered','failed','cancelled');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('turkish', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_categories_search ON categories USING gin(to_tsvector('turkish', name || ' ' || COALESCE(description, '')));

-- Create initial admin user (password: admin123)
INSERT INTO users (id, email, password_hash, role, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'admin@tulumbak.com',
    '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ',
    'super_admin',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create initial categories
INSERT INTO categories (id, name, slug, position, is_active, created_at, updated_at) VALUES
    (uuid_generate_v4(), 'Tatlılar', 'tatlilar', 1, true, NOW(), NOW()),
    (uuid_generate_v4(), 'Tulumbalar', 'tulumbalar', 2, true, NOW(), NOW()),
    (uuid_generate_v4(), 'Baklavalar', 'baklavalar', 3, true, NOW(), NOW()),
    (uuid_generate_v4(), 'Sütlü Tatlılar', 'sutlu-tatlilar', 4, true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Create sample products
INSERT INTO products (id, type, name, slug, category_id, description, sku, price, stock_mode, stock_qty, tax_included, is_active, created_at, updated_at)
SELECT
    uuid_generate_v4(),
    'simple',
    'Klasik Tulumba',
    'klasik-tulumba',
    c.id,
    'Geleneksel lezzet, antep fıstıklı',
    'TLM-001',
    120.00,
    'product',
    100,
    true,
    true,
    NOW(),
    NOW()
FROM categories c WHERE c.slug = 'tulumbalar' LIMIT 1
ON CONFLICT (sku) DO NOTHING;

-- Create notification templates
INSERT INTO notification_templates (id, channel, event, language, subject, body, enabled, created_at, updated_at) VALUES
    (uuid_generate_v4(), 'email', 'order_created', 'tr', 'Siparişiniz Alındı', 'Merhaba {{name}}, siparişiniz başarıyla alınmıştır. Sipariş no: {{order_no}}', true, NOW(), NOW()),
    (uuid_generate_v4(), 'email', 'order_delivered', 'tr', 'Siparişiniz Teslim Edildi', 'Merhaba {{name}}, siparişiniz teslim edilmiştir. Afiyet olsun!', true, NOW(), NOW()),
    (uuid_generate_v4(), 'sms', 'order_on_delivery', 'tr', 'Siparişiniz Yolda', 'Merhaba {{name}}, siparişiniz kuryeye verilmiştir. Tahmini teslimat: {{eta}}', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create application settings
INSERT INTO settings (key, value, description, created_at, updated_at) VALUES
    ('site_name', 'Tulumbak', 'Site adı', NOW(), NOW()),
    ('site_description', 'Lezzetli tatlılar ve Türk mutfağı', 'Site açıklaması', NOW(), NOW()),
    ('currency', 'TRY', 'Varsayılan para birimi', NOW(), NOW()),
    ('tax_included', 'true', 'KDV dahil fiyatlar', NOW(), NOW()),
    ('tax_rate', '0.18', 'KDV oranı', NOW(), NOW()),
    ('min_order_amount', '50.00', 'Minimum sipariş tutarı', NOW(), NOW()),
    ('free_shipping_amount', '200.00', 'Ücretsiz kargo limiti', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- Create triggers for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for reporting
CREATE OR REPLACE VIEW order_summary AS
SELECT
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as order_count,
    COALESCE(SUM(total), 0) as total_revenue,
    AVG(total) as avg_order_value
FROM orders
WHERE status NOT IN ('cancelled', 'failed')
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

CREATE OR REPLACE VIEW product_summary AS
SELECT
    p.name,
    p.sku,
    p.price,
    p.stock_qty,
    c.name as category_name,
    COUNT(oi.id) as order_count,
    COALESCE(SUM(oi.quantity), 0) as total_sold
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status NOT IN ('cancelled', 'failed')
GROUP BY p.id, p.name, p.sku, p.price, p.stock_qty, c.name
ORDER BY total_sold DESC;

-- Grant permissions to the application user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tulumbak_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tulumbak_user;

-- Create indexes for the views
CREATE INDEX IF NOT EXISTS idx_order_summary_date ON order_summary(date);
CREATE INDEX IF NOT EXISTS idx_product_summary_name ON product_summary(name);

-- Output completion message
DO $$
BEGIN
    RAISE NOTICE 'Tulumbak database initialized successfully!';
    RAISE NOTICE 'Admin user: admin@tulumbak.com / admin123';
    RAISE NOTICE 'Database user: tulumbak_user';
    RAISE NOTICE 'Extensions installed: uuid-ossp, pg_trgm, btree_gin, btree_gist';
END $$;