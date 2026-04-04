-- Verification script to test warehouse structure and bin assignments
-- Run this script to verify the migrations worked correctly

-- Step 1: Check warehouse structure
SELECT 
    'WAREHOUSES' as level,
    COUNT(*) as count,
    'Total warehouses created' as description
FROM public.warehouses
WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = 'ef64eaf7-6d5d-4042-8f89-ec9a14db28c2')

UNION ALL

SELECT 
    'ZONES' as level,
    COUNT(*) as count,
    'Total zones created across all warehouses' as description
FROM public.zones
WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = 'ef64eaf7-6d5d-4042-8f89-ec9a14db28c2')

UNION ALL

SELECT 
    'RACKS' as level,
    COUNT(*) as count,
    'Total racks created across all zones' as description
FROM public.racks
WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = 'ef64eaf7-6d5d-4042-8f89-ec9a14db28c2')

UNION ALL

SELECT 
    'BINS' as level,
    COUNT(*) as count,
    'Total bins created across all racks' as description
FROM public.bins
WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = 'ef64eaf7-6d5d-4042-8f89-ec9a14db28c2')

ORDER BY level;

-- Step 2: Check stock level assignments
SELECT 
    'STOCK LEVELS' as category,
    COUNT(*) as total_count,
    description
FROM (
    SELECT 
        'TOTAL STOCK' as category,
        COUNT(*) as total_count,
        'All stock levels' as description
    FROM public.stock_levels
    WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = 'ef64eaf7-6d5d-4042-8f89-ec9a14db28c2')
    
    UNION ALL
    
    SELECT 
        'WITH BINS' as category,
        COUNT(*) as total_count,
        'Stock levels assigned to bins' as description
    FROM public.stock_levels
    WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = 'ef64eaf7-6d5d-4042-8f89-ec9a14db28c2')
    AND bin_id IS NOT NULL
    
    UNION ALL
    
    SELECT 
        'WITHOUT BINS' as category,
        COUNT(*) as total_count,
        'Stock levels without bin assignments (should be 0)' as description
    FROM public.stock_levels
    WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = 'ef64eaf7-6d5d-4042-8f89-ec9a14db28c2')
    AND bin_id IS NULL
) results
ORDER BY category;

-- Step 3: Sample stock locations
SELECT 
    'SAMPLE LOCATIONS' as info_type,
    sl.sku_code,
    sl.sku_name,
    w.name as warehouse_name,
    z.name as zone_name,
    sl.bin_code,
    (sl.quantity_available + sl.quantity_reserved + sl.quantity_in_transit + sl.quantity_damaged) as total_quantity
FROM public.stock_levels sl
JOIN public.warehouses w ON sl.warehouse_id = w.id
LEFT JOIN public.zones z ON sl.zone_id = z.id
WHERE sl.tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = 'ef64eaf7-6d5d-4042-8f89-ec9a14db28c2')
ORDER BY sl.sku_code
LIMIT 5;

-- Step 4: Zone capacity utilization
SELECT 
    'ZONE UTILIZATION' as info_type,
    w.name as warehouse_name,
    z.name as zone_name,
    z.type as zone_type,
    z.total_capacity,
    z.used_capacity,
    CASE 
        WHEN z.total_capacity > 0 THEN ROUND((z.used_capacity::decimal / z.total_capacity::decimal) * 100, 2)
        ELSE 0
    END as utilization_percentage
FROM public.zones z
JOIN public.warehouses w ON z.warehouse_id = w.id
WHERE z.tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = 'ef64eaf7-6d5d-4042-8f89-ec9a14db28c2')
ORDER BY w.name, z.name;

-- Step 5: Check for any orphaned stock levels (should be none)
SELECT 
    'ORPHANED CHECK' as status,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ No orphaned stock levels'
        ELSE '❌ Found orphaned stock levels'
    END as message
FROM public.stock_levels sl
WHERE sl.tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = 'ef64eaf7-6d5d-4042-8f89-ec9a14db28c2')
AND (
    sl.bin_id IS NULL 
    OR sl.zone_id IS NULL
    OR NOT EXISTS (SELECT 1 FROM public.bins b WHERE b.id = sl.bin_id)
    OR NOT EXISTS (SELECT 1 FROM public.zones z WHERE z.id = sl.zone_id)
);
