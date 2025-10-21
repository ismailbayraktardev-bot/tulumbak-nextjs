-- =====================================================
-- Izmir Specific Data for Tulumbak E-commerce
-- =====================================================

-- Clear existing Istanbul data and insert Izmir branches
DELETE FROM zones WHERE city LIKE '%İstanbul%' OR city LIKE '%Istanbul%';
DELETE FROM branches WHERE city LIKE '%İstanbul%' OR city LIKE '%Istanbul%';

-- Insert main Izmir branch
INSERT INTO branches (
    name, address, city, district, phone, email,
    working_hours, is_main_branch
) VALUES (
    'Tulumbak İzmir Şubesi',
    'Konak Meydanı No:456 Konak/İzmir',
    'İzmir', 'Konak', '+90 232 123 45 67', 'izmir@tulumbak.com',
    '09:00-21:00', true
) ON CONFLICT DO NOTHING;

-- Insert Izmir zones (major districts)
INSERT INTO zones (
    name, city, district, postal_codes, branch_id,
    delivery_fee, estimated_delivery_time
) SELECT
    'Konak Merkez', 'İzmir', 'Konak', ARRAY['35230', '35240', '35250', '35260'],
    id, 15.00, 30
FROM branches WHERE name = 'Tulumbak İzmir Şubesi' AND is_main_branch = true
ON CONFLICT DO NOTHING;

INSERT INTO zones (
    name, city, district, postal_codes, branch_id,
    delivery_fee, estimated_delivery_time
) SELECT
    'Bornova', 'İzmir', 'Bornova', ARRAY['35050', '35060', '35070', '35080'],
    id, 20.00, 45
FROM branches WHERE name = 'Tulumbak İzmir Şubesi' AND is_main_branch = true
ON CONFLICT DO NOTHING;

INSERT INTO zones (
    name, city, district, postal_codes, branch_id,
    delivery_fee, estimated_delivery_time
) SELECT
    'Karşıyaka', 'İzmir', 'Karşıyaka', ARRAY['35540', '35550', '35560', '35570'],
    id, 25.00, 60
FROM branches WHERE name = 'Tulumbak İzmir Şubesi' AND is_main_branch = true
ON CONFLICT DO NOTHING;

INSERT INTO zones (
    name, city, district, postal_codes, branch_id,
    delivery_fee, estimated_delivery_time
) SELECT
    'Buca', 'İzmir', 'Buca', ARRAY['35370', '35380', '35390', '35400'],
    id, 20.00, 50
FROM branches WHERE name = 'Tulumbak İzmir Şubesi' AND is_main_branch = true
ON CONFLICT DO NOTHING;

INSERT INTO zones (
    name, city, district, postal_codes, branch_id,
    delivery_fee, estimated_delivery_time
) SELECT
    'Alsancak', 'İzmir', 'Konak', ARRAY['35220', '35210'],
    id, 15.00, 25
FROM branches WHERE name = 'Tulumbak İzmir Şubesi' AND is_main_branch = true
ON CONFLICT DO NOTHING;

INSERT INTO zones (
    name, city, district, postal_codes, branch_id,
    delivery_fee, estimated_delivery_time
) SELECT
    'Gaziemir', 'İzmir', 'Gaziemir', ARRAY['35410', '35420', '35430'],
    id, 25.00, 55
FROM branches WHERE name = 'Tulumbak İzmir Şubesi' AND is_main_branch = true
ON CONFLICT DO NOTHING;

-- Verify insertion
SELECT
    'Izmir Branches created: ' || COUNT(*) as result
FROM branches WHERE city = 'İzmir';

SELECT
    'Izmir Zones created: ' || COUNT(*) as result
FROM zones WHERE city = 'İzmir';

-- Show the zones we created
SELECT
    z.name as zone_name,
    z.district,
    z.delivery_fee,
    z.estimated_delivery_time,
    array_to_string(z.postal_codes, ', ') as postal_codes
FROM zones z
WHERE z.city = 'İzmir'
ORDER BY z.delivery_fee;