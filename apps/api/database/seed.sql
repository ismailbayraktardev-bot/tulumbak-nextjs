-- Tulumbak E-commerce Sample Data
-- Turkish sweets and desserts categories and products

-- Clear existing data (for development)
DELETE FROM products;
DELETE FROM categories;

-- Categories
INSERT INTO categories (id, name, slug, parent_id, position, is_active) VALUES
-- Main categories
('550e8400-e29b-41d4-a716-446655440001', 'Tatlılar', 'tatlilar', NULL, 1, true),
('550e8400-e29b-41d4-a716-446655440002', 'İçecekler', 'icecekler', NULL, 2, true),

-- Subcategories under Tatlılar
('550e8400-e29b-41d4-a716-446655440003', 'Tulumbalar', 'tulumbalar', '550e8400-e29b-41d4-a716-446655440001', 1, true),
('550e8400-e29b-41d4-a716-446655440004', 'Baklavalar', 'baklavalar', '550e8400-e29b-41d4-a716-446655440001', 2, true),
('550e8400-e29b-41d4-a716-446655440005', 'Sütlü Tatlılar', 'sutlu-tatlilar', '550e8400-e29b-41d4-a716-446655440001', 3, true),
('550e8400-e29b-41d4-a716-446655440006', 'Kuru Tatlılar', 'kuru-tatlilar', '550e8400-e29b-41d4-a716-446655440001', 4, true),

-- Subcategories under İçecekler
('550e8400-e29b-41d4-a716-446655440007', 'Türk Kahvesi', 'turk-kahvesi', '550e8400-e29b-41d4-a716-446655440002', 1, true),
('550e8400-e29b-41d4-a716-446655440008', 'Çay', 'cay', '550e8400-e29b-41d4-a716-446655440002', 2, true),
('550e8400-e29b-41d4-a716-446655440009', 'Şerbetler', 'serbetler', '550e8400-e29b-41d4-a716-446655440002', 3, true)
ON CONFLICT DO NOTHING;

-- Products

-- Tulumbalar
INSERT INTO products (id, type, name, slug, category_id, description, sku, price, stock_mode, stock_qty, images, tax_included, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'simple', 'Klasik Tulumba', 'klasik-tulumba', '550e8400-e29b-41d4-a716-446655440003', 'Geleneksel lezzet, şerbet ile ıslanmış çıtır tulumba', 'TLM-001', 120.00, 'product', 100, '[{"url":"https://picsum.photos/seed/tulumba1/400/300.jpg","alt":"Klasik Tulumba"}]', true, true),
('660e8400-e29b-41d4-a716-446655440002', 'simple', 'Antep Fıstıklı Tulumba', 'antep-fistikli-tulumba', '550e8400-e29b-41d4-a716-446655440003', 'Kaliteli Antep fıstığı ile süslenmiş özel lezzet', 'TLM-002', 150.00, 'product', 80, '[{"url":"https://picsum.photos/seed/tulumba2/400/300.jpg","alt":"Antep Fıstıklı Tulumba"}]', true, true),
('660e8400-e29b-41d4-a716-446655440003', 'simple', 'Cevizli Tulumba', 'cevizli-tulumba', '550e8400-e29b-41d4-a716-446655440003', 'Doğran ceviz ile zenginleştirilmiş lezzet', 'TLM-003', 140.00, 'product', 60, '[{"url":"https://picsum.photos/seed/tulumba3/400/300.jpg","alt":"Cevizli Tulumba"}]', true, true),
('660e8400-e29b-41d4-a716-446655440004', 'simple', 'Çikolatalı Tulumba', 'cikolatali-tulumba', '550e8400-e29b-41d4-a716-446655440003', 'Belçika çikolatası ile kaplanmış modern lezzet', 'TLM-004', 160.00, 'product', 40, '[{"url":"https://picsum.photos/seed/tulumba4/400/300.jpg","alt":"Çikolatalı Tulumba"}]', true, true),

-- Baklavalar
('660e8400-e29b-41d4-a716-446655440005', 'simple', 'Antep Baklavası', 'antep-baklavasi', '550e8400-e29b-41d4-a716-446655440004', '40 kat yufka, Antep fıstığı ve şerbet ile hazırlanan klâsik', 'BKV-001', 200.00, 'product', 50, '[{"url":"https://picsum.photos/seed/baklava1/400/300.jpg","alt":"Antep Baklavası"}]', true, true),
('660e8400-e29b-41d4-a716-446655440006', 'simple', 'Fıstık Sarması', 'fistik-sarmasi', '550e8400-e29b-41d4-a716-446655440004', 'Rulo şeklinde sarılmış fıstıklı baklava', 'BKV-002', 180.00, 'product', 45, '[{"url":"https://picsum.photos/seed/baklava2/400/300.jpg","alt":"Fıstık Sarması"}]', true, true),
('660e8400-e29b-41d4-a716-446655440007', 'simple', 'Sultan Baklavası', 'sultan-baklavasi', '550e8400-e29b-41d4-a716-446655440004', 'Sultanların favorisi, özel karışım', 'BKV-003', 220.00, 'product', 30, '[{"url":"https://picsum.photos/seed/baklava3/400/300.jpg","alt":"Sultan Baklavası"}]', true, true),

-- Sütlü Tatlılar
('660e8400-e29b-41d4-a716-446655440008', 'simple', 'Sultan Sarması', 'sultan-sarmasi', '550e8400-e29b-41d4-a716-446655440005', 'Muhallebi sarılıp üzerine Antep fıstığı serilen lezzet', 'SUT-001', 90.00, 'product', 70, '[{"url":"https://picsum.photos/seed/sultan1/400/300.jpg","alt":"Sultan Sarması"}]', true, true),
('660e8400-e29b-41d4-a716-446655440009', 'simple', 'Tavukgöğsü', 'tavukgogsu', '550e8400-e29b-41d4-a716-446655440005', 'Tel tel yufkalar ile hazırlanan ikramlık', 'SUT-002', 70.00, 'product', 60, '[{"url":"https://picsum.photos/seed/tavuk1/400/300.jpg","alt":"Tavukgöğsü"}]', true, true),
('660e8400-e29b-41d4-a716-446655440010', 'simple', 'Künefe', 'kunefe', '550e8400-e29b-41d4-a716-446655440005', 'Hatay künefesi, kadayıf ve taze peynir ile', 'SUT-003', 250.00, 'product', 25, '[{"url":"https://picsum.photos/seed/kunefe1/400/300.jpg","alt":"Künefe"}]', true, true),

-- Kuru Tatlılar
('660e8400-e29b-41d4-a716-446655440011', 'simple', 'Lokum', 'lokum', '550e8400-e29b-41d4-a716-446655440006', 'Geleneksel Türk lokumu, çeşitli seçenekler', 'KUR-001', 80.00, 'product', 100, '[{"url":"https://picsum.photos/seed/lokum1/400/300.jpg","alt":"Lokum"}]', true, true),
('660e8400-e29b-41d4-a716-446655440012', 'simple', 'Aşure', 'asure', '550e8400-e29b-41d4-a716-446655440006', 'Bin bir tatlıdan oluşan bereket tatlısı', 'KUR-002', 60.00, 'product', 40, '[{"url":"https://picsum.photos/seed/asure1/400/300.jpg","alt":"Aşure"}]', true, true),

-- İçecekler
('660e8400-e29b-41d4-a716-446655440013', 'simple', 'Türk Kahvesi', 'turk-kahvesi', '550e8400-e29b-41d4-a716-446655440007', 'Özel demleme, köpüklü lezzet', 'KAH-001', 40.00, 'product', 200, '[{"url":"https://picsum.photos/seed/kahve1/400/300.jpg","alt":"Türk Kahvesi"}]', true, true),
('660e8400-e29b-41d4-a716-446655440014', 'simple', 'Çay', 'cay', '550e8400-e29b-41d4-a716-446655440008', 'Demlenmiş Rize çayı', 'KAH-002', 20.00, 'product', 500, '[{"url":"https://picsum.photos/seed/cay1/400/300.jpg","alt":"Türk Çayı"}]', true, true),
('660e8400-e29b-41d4-a716-446655440015', 'simple', 'Limonata', 'limonata', '550e8400-e29b-41d4-a716-446655440009', 'Taze limondan yapılmış ferahlatıcı içecek', 'SER-001', 30.00, 'product', 150, '[{"url":"https://picsum.photos/seed/limon1/400/300.jpg","alt":"Limonata"}]', true, true)
ON CONFLICT DO NOTHING;

-- Insert more products for better variety
INSERT INTO products (id, type, name, slug, category_id, description, sku, price, stock_mode, stock_qty, images, tax_included, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440016', 'simple', 'Mozaik Pasta', 'mozaik-pasta', '550e8400-e29b-41d4-a716-446655440005', 'Bisküvi, krem şanti ve meyve ile hazırlanan', 'SUT-004', 75.00, 'product', 55, '[{"url":"https://picsum.photos/seed/mozaik1/400/300.jpg","alt":"Mozaik Pasta"}]', true, true),
('660e8400-e29b-41d4-a716-446655440017', 'simple', 'Trileçe', 'trilece', '550e8400-e29b-41d4-a716-446655440005', 'Balkan mutfağından kremalı pasta', 'SUT-005', 85.00, 'product', 45, '[{"url":"https://picsum.photos/seed/trilece1/400/300.jpg","alt":"Trileçe"}]', true, true),
('660e8400-e29b-41d4-a716-446655440018', 'simple', 'Pasta Sarması', 'pasta-sarmasi', '550e8400-e29b-41d4-a716-446655440004', 'Tel yufka sarılmış iç cevizli baklava', 'BKV-004', 170.00, 'product', 35, '[{"url":"https://picsum.photos/seed/pasta1/400/300.jpg","alt":"Pasta Sarması"}]', true, true),
('660e8400-e29b-41d4-a716-446655440019', 'simple', 'Dolma Baklava', 'dolma-baklava', '550e8400-e29b-41d4-a716-446655440004', 'İç cevizli özel baklava', 'BKV-005', 210.00, 'product', 28, '[{"url":"https://picsum.photos/seed/dolma1/400/300.jpg","alt":"Dolma Baklava"}]', true, true),
('660e8400-e29b-41d4-a716-446655440020', 'simple', 'Havuç Lokumu', 'havuc-lokumu', '550e8400-e29b-41d4-a716-446655440006', 'Sağlıklı ve lezzetli havuç tatlısı', 'KUR-003', 90.00, 'product', 65, '[{"url":"https://picsum.photos/seed/havuc1/400/300.jpg","alt":"Havuç Lokumu"}]', true, true),
('660e8400-e29b-41d4-a716-446655440021', 'simple', 'Salep', 'salep', '550e8400-e29b-41d4-a716-446655440007', 'Geleneksel kış içeceği', 'KAH-003', 35.00, 'product', 80, '[{"url":"https://picsum.photos/seed/salep1/400/300.jpg","alt":"Salep"}]', true, true),
('660e8400-e29b-41d4-a716-446655440022', 'simple', 'Ayran', 'ayran', '550e8400-e29b-41d4-a716-446655440009', 'Yoğurt, su ve tuz ile hazırlanan', 'SER-002', 25.00, 'product', 300, '[{"url":"https://picsum.photos/seed/ayran1/400/300.jpg","alt":"Ayran"}]', true, true),
('660e8400-e29b-41d4-a716-446655440023', 'simple', 'Portakal Suyu', 'portakal-suyu', '550e8400-e29b-41d4-a716-446655440009', 'Taze sıkılmış portakal', 'SER-003', 35.00, 'product', 120, '[{"url":"https://picsum.photos/seed/portakal1/400/300.jpg","alt":"Portakal Suyu"}]', true, true),
('660e8400-e29b-41d4-a716-446655440024', 'simple', 'Vişne Suyu', 'visne-suyu', '550e8400-e29b-41d4-a716-446655440009', 'Ekşi ve ferahlatıcı vişne suyu', 'SER-004', 40.00, 'product', 90, '[{"url":"https://picsum.photos/seed/visne1/400/300.jpg","alt":"Vişne Suyu"}]', true, true)
ON CONFLICT DO NOTHING;

-- Update sequence for categories
ALTER SEQUENCE IF EXISTS categories_id_seq RESTART WITH 550e8400-e29b-41d4-a716-446655440100;
ALTER SEQUENCE IF EXISTS products_id_seq RESTART WITH 660e8400-e29b-41d4-a716-446655440100;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Tulumbak sample data loaded successfully!';
  RAISE NOTICE 'Categories: 9 (6 active)';
  RAISE NOTICE 'Products: 24 (all active)';
END $$;