-- =====================================================
-- Sample Data for Branches & Zones (PostGIS-independent)
-- =====================================================

-- Insert main branch (Istanbul Kadıköy) - without coordinates for now
INSERT INTO branches (
    name, address, city, district, phone, email,
    working_hours, is_main_branch
) VALUES (
    'Tulumbak Kadıköy Şubesi',
    'Rıhtım Cd. No:123 Kadıköy/İstanbul',
    'İstanbul', 'Kadıköy', '+90 216 123 45 67', 'kadikoy@tulumbak.com',
    '09:00-21:00', true
) ON CONFLICT DO NOTHING;

-- Insert sample zones for Istanbul (after branch is created)
INSERT INTO zones (
    name, city, district, postal_codes, branch_id,
    delivery_fee, estimated_delivery_time
) SELECT
    'Kadıköy Merkez', 'İstanbul', 'Kadıköy', ARRAY['34710', '34712', '34714', '34716'],
    id, 15.00, 45
FROM branches WHERE name = 'Tulumbak Kadıköy Şubesi' AND is_main_branch = true
ON CONFLICT DO NOTHING;

INSERT INTO zones (
    name, city, district, postal_codes, branch_id,
    delivery_fee, estimated_delivery_time
) SELECT
    'Üsküdar', 'İstanbul', 'Üsküdar', ARRAY['34660', '34662', '34664', '34668'],
    id, 20.00, 60
FROM branches WHERE name = 'Tulumbak Kadıköy Şubesi' AND is_main_branch = true
ON CONFLICT DO NOTHING;

INSERT INTO zones (
    name, city, district, postal_codes, branch_id,
    delivery_fee, estimated_delivery_time
) SELECT
    'Beşiktaş', 'İstanbul', 'Beşiktaş', ARRAY['34340', '34342', '34349', '34353'],
    id, 25.00, 75
FROM branches WHERE name = 'Tulumbak Kadıköy Şubesi' AND is_main_branch = true
ON CONFLICT DO NOTHING;

-- Verify insertion
SELECT
    'Branches created: ' || COUNT(*) as result
FROM branches WHERE is_main_branch = true;

SELECT
    'Zones created: ' || COUNT(*) as result
FROM zones WHERE branch_id IS NOT NULL;