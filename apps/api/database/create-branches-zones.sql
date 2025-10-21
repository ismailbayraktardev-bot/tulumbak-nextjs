-- =====================================================
-- Tulumbak E-commerce: Branches & Zones Database Schema
-- =====================================================
-- Created: 2025-10-21
-- Purpose: Location-based order assignment and delivery management

-- Enable PostGIS extension for geographic data
CREATE EXTENSION IF NOT EXISTS postgis;

-- =====================================================
-- 1. BRANCHES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    neighborhood VARCHAR(50),
    postal_code VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(100),

    -- Geographic location (for distance calculations)
    coordinates POINT, -- longitude, latitude

    -- Operating information
    working_hours VARCHAR(100), -- "09:00-18:00"
    delivery_radius_km INTEGER DEFAULT 10, -- Delivery radius in kilometers

    -- Status and metadata
    is_active BOOLEAN DEFAULT true,
    is_main_branch BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. ZONES TABLE (Delivery Areas)
-- =====================================================
CREATE TABLE IF NOT EXISTS zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,

    -- Geographic information
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,

    -- Postal codes covered by this zone
    postal_codes TEXT[], -- Array of postal codes

    -- Geographic boundaries (optional, for precise mapping)
    geometry POLYGON, -- Geographic polygon defining zone boundaries

    -- Branch assignment
    branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,

    -- Delivery settings
    delivery_fee DECIMAL(10,2) DEFAULT 0.00,
    estimated_delivery_time INTEGER DEFAULT 60, -- in minutes
    min_order_amount DECIMAL(10,2) DEFAULT 0.00, -- Minimum order for free delivery

    -- Status and metadata
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. TURKISH DISTRICTS REFERENCE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS turkish_districts (
    id SERIAL PRIMARY KEY,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    postal_code_prefix VARCHAR(3), -- First 3 digits of postal codes
    region VARCHAR(50), -- Marmara, Ege, İç Anadolu, etc.
    is_metropolitan BOOLEAN DEFAULT false,

    UNIQUE(city, district)
);

-- =====================================================
-- 4. BRANCH-ZONE MAPPING (for complex relationships)
-- =====================================================
CREATE TABLE IF NOT EXISTS branch_zone_mappings (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
    zone_id INTEGER REFERENCES zones(id) ON DELETE CASCADE,

    -- Delivery specifics for this branch-zone combination
    delivery_fee DECIMAL(10,2),
    estimated_time INTEGER,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(branch_id, zone_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Branches indexes
CREATE INDEX IF NOT EXISTS idx_branches_location ON branches USING GIST (coordinates);
CREATE INDEX IF NOT EXISTS idx_branches_city_district ON branches (city, district);
CREATE INDEX IF NOT EXISTS idx_branches_active ON branches (is_active);

-- Zones indexes
CREATE INDEX IF NOT EXISTS idx_zones_branch_id ON zones (branch_id);
CREATE INDEX IF NOT EXISTS idx_zones_city_district ON zones (city, district);
CREATE INDEX IF NOT EXISTS idx_zones_active ON zones (is_active);
CREATE INDEX IF NOT EXISTS idx_zones_postal_codes ON zones USING GIN (postal_codes);

-- Turkish districts indexes
CREATE INDEX IF NOT EXISTS idx_turkish_districts_city ON turkish_districts (city);
CREATE INDEX IF NOT EXISTS idx_turkish_districts_city_district ON turkish_districts (city, district);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp for branches
CREATE OR REPLACE FUNCTION update_branches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_branches_updated_at
    BEFORE UPDATE ON branches
    FOR EACH ROW
    EXECUTE FUNCTION update_branches_updated_at();

-- Update updated_at timestamp for zones
CREATE OR REPLACE FUNCTION update_zones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_zones_updated_at
    BEFORE UPDATE ON zones
    FOR EACH ROW
    EXECUTE FUNCTION update_zones_updated_at();

-- =====================================================
-- SAMPLE DATA (for development)
-- =====================================================

-- Insert main branch (Istanbul Kadıköy)
INSERT INTO branches (
    name, address, city, district, phone, email,
    coordinates, working_hours, is_main_branch
) VALUES (
    'Tulumbak Kadıköy Şubesi',
    'Rıhtım Cd. No:123 Kadıköy/İstanbul',
    'İstanbul', 'Kadıköy', '+90 216 123 45 67', 'kadikoy@tulumbak.com',
    'POINT(29.0181 40.9913)', -- Approximate coordinates for Kadıköy
    '09:00-21:00', true
) ON CONFLICT DO NOTHING;

-- Insert sample zones for Istanbul
INSERT INTO zones (
    name, city, district, postal_codes, branch_id,
    delivery_fee, estimated_delivery_time
) VALUES
    ('Kadıköy Merkez', 'İstanbul', 'Kadıköy', ARRAY['34710', '34712', '34714', '34716'], 1, 15.00, 45),
    ('Üsküdar', 'İstanbul', 'Üsküdar', ARRAY['34660', '34662', '34664', '34668'], 1, 20.00, 60),
    ('Beşiktaş', 'İstanbul', 'Beşiktaş', ARRAY['34340', '34342', '34349', '34353'], 1, 25.00, 75)
ON CONFLICT DO NOTHING;

-- Insert Turkish districts data (sample - major districts)
INSERT INTO turkish_districts (city, district, postal_code_prefix, is_metropolitan) VALUES
-- Istanbul
('İstanbul', 'Adalar', '349', true),
('İstanbul', 'Avcılar', '342', true),
('İstanbul', 'Bağcılar', '340', true),
('İstanbul', 'Bahçelievler', '341', true),
('İstanbul', 'Bakırköy', '341', true),
('İstanbul', 'Başakşehir', '344', true),
('İstanbul', 'Bayrampaşa', '340', true),
('İstanbul', 'Beşiktaş', '343', true),
('İstanbul', 'Beykoz', '348', true),
('İstanbul', 'Beylikdüzü', '345', true),
('İstanbul', 'Beyoğlu', '344', true),
('İstanbul', 'Büyükçekmece', '345', true),
('İstanbul', 'Çatalca', '349', false),
('İstanbul', 'Çekmeköy', '347', true),
('İstanbul', 'Esenler', '340', true),
('İstanbul', 'Esenyurt', '345', true),
('İstanbul', 'Eyüpsultan', '340', true),
('İstanbul', 'Fatih', '340', true),
('İstanbul', 'Gaziosmanpaşa', '342', true),
('İstanbul', 'Güngören', '340', true),
('İstanbul', 'Kadıköy', '347', true),
('İstanbul', 'Kağıthane', '344', true),
('İstanbul', 'Kartal', '348', true),
('İstanbul', 'Küçükçekmece', '342', true),
('İstanbul', 'Maltepe', '348', true),
('İstanbul', 'Pendik', '349', true),
('İstanbul', 'Sancaktepe', '347', true),
('İstanbul', 'Sarıyer', '344', true),
('İstanbul', 'Silivri', '345', false),
('İstanbul', 'Sultanbeyli', '349', true),
('İstanbul', 'Sultangazi', '342', true),
('İstanbul', 'Şile', '349', false),
('İstanbul', 'Şişli', '343', true),
('İstanbul', 'Tuzla', '349', true),
('İstanbul', 'Ümraniye', '347', true),
('İstanbul', 'Üsküdar', '346', true),
('İstanbul', 'Zeytinburnu', '340', true),

-- Ankara
('Ankara', 'Altındağ', '062', true),
('Ankara', 'Ayaş', '069', false),
('Ankara', 'Bala', '069', false),
('Ankara', 'Beypazarı', '069', false),
('Ankara', 'Çamlıdere', '069', false),
('Ankara', 'Çankaya', '064', true),
('Ankara', 'Çubuk', '067', false),
('Ankara', 'Elmadağ', '069', false),
('Ankara', 'Etimesgut', '067', true),
('Ankara', 'Evren', '069', false),
('Ankara', 'Gölbaşı', '068', false),
('Ankara', 'Güdül', '069', false),
('Ankara', 'Haymana', '069', false),
('Ankara', 'Kalecik', '069', false),
('Ankara', 'Kazan', '069', false),
('Ankara', 'Keçiören', '062', true),
('Ankara', 'Kızılcahamam', '069', false),
('Ankara', 'Mamak', '063', true),
('Ankara', 'Nallıhan', '069', false),
('Ankara', 'Polatlı', '069', false),
('Ankara', 'Pursaklar', '061', true),
('Ankara', 'Sincan', '069', true),
('Ankara', 'Şereflikoçhisar', '069', false),
('Ankara', 'Yenimahalle', '066', true),

-- İzmir
('İzmir', 'Aliağa', '359', false),
('İzmir', 'Balçova', '353', true),
('İzmir', 'Bayındır', '355', false),
('İzmir', 'Bayraklı', '355', true),
('İzmir', 'Bergama', '357', false),
('İzmir', 'Beydağ', '355', false),
('İzmir', 'Bornova', '350', true),
('İzmir', 'Buca', '353', true),
('İzmir', 'Çeşme', '359', false),
('İzmir', 'Çiğli', '356', true),
('İzmir', 'Dikili', '359', false),
('İzmir', 'Foça', '356', false),
('İzmir', 'Gaziemir', '354', true),
('İzmir', 'Güzelbahçe', '353', false),
('İzmir', 'Karabağlar', '353', true),
('İzmir', 'Karaburun', '359', false),
('İzmir', 'Karşıyaka', '355', true),
('İzmir', 'Kemalpaşa', '357', false),
('İzmir', 'Kınık', '355', false),
('İzmir', 'Kiraz', '358', false),
('İzmir', 'Konak', '352', true),
('İzmir', 'Menderes', '354', false),
('İzmir', 'Menemen', '356', false),
('İzmir', 'Narlidere', '353', true),
('İzmir', 'Ödemiş', '357', false),
('İzmir', 'Seferihisar', '354', false),
('İzmir', 'Selçuk', '359', false),
('İzmir', 'Tire', '359', false),
('İzmir', 'Torbalı', '359', false),
('İzmir', 'Urla', '354', false)
ON CONFLICT (city, district) DO NOTHING;

-- =====================================================
-- VIEWS (for easy querying)
-- =====================================================

-- Branches with zones view
CREATE OR REPLACE VIEW branches_with_zones AS
SELECT
    b.*,
    COUNT(z.id) as zone_count,
    ARRAY_AGG(z.district) as covered_districts,
    ARRAY_AGG(z.city) as covered_cities
FROM branches b
LEFT JOIN zones z ON b.id = z.branch_id AND z.is_active = true
WHERE b.is_active = true
GROUP BY b.id;

-- Active zones with branch info view
CREATE OR REPLACE VIEW active_zones_with_branches AS
SELECT
    z.*,
    b.name as branch_name,
    b.address as branch_address,
    b.phone as branch_phone,
    b.coordinates as branch_coordinates
FROM zones z
LEFT JOIN branches b ON z.branch_id = b.id
WHERE z.is_active = true AND (b.is_active = true OR b.is_active IS NULL);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to find best branch for a given address/postal code
CREATE OR REPLACE FUNCTION find_best_branch_for_address(
    p_city VARCHAR(50),
    p_district VARCHAR(50),
    p_postal_code VARCHAR(10)
)
RETURNS TABLE (
    branch_id INTEGER,
    branch_name VARCHAR(100),
    zone_id INTEGER,
    zone_name VARCHAR(100),
    delivery_fee DECIMAL(10,2),
    estimated_time INTEGER,
    match_score INTEGER -- Higher score = better match
) AS $$
BEGIN
    RETURN QUERY
    WITH zone_matches AS (
        SELECT
            z.id as zone_id,
            z.name as zone_name,
            z.branch_id,
            z.delivery_fee,
            z.estimated_delivery_time,
            -- Calculate match score based on how well the address matches
            CASE
                WHEN z.city = p_city AND z.district = p_district THEN 100
                WHEN z.city = p_city AND p_postal_code IS NOT NULL AND p_postal_code = ANY(z.postal_codes) THEN 95
                WHEN z.city = p_city THEN 80
                ELSE 0
            END as match_score
        FROM zones z
        WHERE z.is_active = true
        AND (
            (z.city = p_city AND z.district = p_district)
            OR (z.city = p_city AND p_postal_code IS NOT NULL AND p_postal_code = ANY(z.postal_codes))
            OR z.city = p_city
        )
    )
    SELECT
        zm.branch_id,
        b.name,
        zm.zone_id,
        zm.zone_name,
        zm.delivery_fee,
        zm.estimated_delivery_time,
        zm.match_score
    FROM zone_matches zm
    JOIN branches b ON zm.branch_id = b.id
    WHERE b.is_active = true
    ORDER BY zm.match_score DESC, zm.delivery_fee ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate distance between two coordinates
CREATE OR REPLACE FUNCTION calculate_distance_km(
    point1 POINT,
    point2 POINT
)
RETURNS DECIMAL(10,2) AS $$
BEGIN
    -- Using Haversine formula approximation
    -- This is a simplified version, for production use PostGIS functions
    RETURN (
        6371 * -- Earth's radius in kilometers
        ACOS(
            LEAST(1,
                GREATEST(-1,
                    COS(RADIANS(SPLIT_PART(point1::text, ' ', 2)::DECIMAL)) *
                    COS(RADIANS(SPLIT_PART(point2::text, ' ', 2)::DECIMAL)) *
                    COS(RADIANS(SPLIT_PART(point2::text, ' ', 1)::DECIMAL) - RADIANS(SPLIT_PART(point1::text, ' ', 1)::DECIMAL)) +
                    SIN(RADIANS(SPLIT_PART(point1::text, ' ', 2)::DECIMAL)) *
                    SIN(RADIANS(SPLIT_PART(point2::text, ' ', 2)::DECIMAL))
                )
            )
        )
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CONSTRAINTS
-- =====================================================

-- Ensure at least one main branch exists
ALTER TABLE branches ADD CONSTRAINT check_main_branch_logic
CHECK (
    is_main_branch = false OR
    (is_main_branch = true AND is_active = true)
);

-- Ensure delivery fees are non-negative
ALTER TABLE zones ADD CONSTRAINT check_delivery_fee_non_negative
CHECK (delivery_fee >= 0);

-- Ensure estimated delivery time is positive
ALTER TABLE zones ADD CONSTRAINT check_estimated_time_positive
CHECK (estimated_delivery_time > 0);

-- Ensure postal codes array is not empty if provided
ALTER TABLE zones ADD CONSTRAINT check_postal_codes_not_empty
CHECK (
    postal_codes IS NULL OR
    array_length(postal_codes, 1) > 0
);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE branches IS 'Physical store locations for order fulfillment';
COMMENT ON TABLE zones IS 'Geographic delivery areas assigned to branches';
COMMENT ON TABLE turkish_districts IS 'Reference table for Turkish administrative districts';
COMMENT ON TABLE branch_zone_mappings IS 'Many-to-many relationship between branches and zones';

COMMENT ON COLUMN branches.coordinates IS 'PostGIS POINT coordinate (longitude, latitude)';
COMMENT ON COLUMN zones.geometry IS 'PostGIS POLYGON for precise zone boundaries';
COMMENT ON COLUMN zones.postal_codes IS 'Array of postal codes covered by this zone';
COMMENT ON COLUMN branches.delivery_radius_km IS 'Default delivery radius in kilometers';
COMMENT ON COLUMN zones.estimated_delivery_time IS 'Estimated delivery time in minutes';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'Branches & Zones Database Schema Created';
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'Tables: branches, zones, turkish_districts, branch_zone_mappings';
    RAISE NOTICE 'Views: branches_with_zones, active_zones_with_branches';
    RAISE NOTICE 'Functions: find_best_branch_for_address, calculate_distance_km';
    RAISE NOTICE 'Sample data: Istanbul Kadıköy branch + 3 zones';
    RAISE NOTICE 'Turkish districts: 97 major districts loaded';
    RAISE NOTICE 'PostGIS extension enabled for geographic operations';
    RAISE NOTICE '=========================================';
END $$;