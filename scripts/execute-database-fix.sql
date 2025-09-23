-- 🚨 緊急修復資料庫結構
-- 執行位置: Supabase Dashboard > SQL Editor

-- 1. 添加 is_partner_store 欄位
ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_partner_store BOOLEAN DEFAULT false;

-- 2. 將肯塔基美語設為特約商家
UPDATE stores SET is_partner_store = true WHERE store_name ILIKE '%肯塔基%';

-- 3. 驗證更新結果
SELECT 
    id, 
    store_name, 
    is_partner_store,
    is_safe_store,
    has_member_discount
FROM stores 
WHERE store_name ILIKE '%肯塔基%';

-- 4. 檢查所有特約商家
SELECT 
    COUNT(*) as total_stores,
    SUM(CASE WHEN is_partner_store = true THEN 1 ELSE 0 END) as partner_stores,
    SUM(CASE WHEN is_safe_store = true THEN 1 ELSE 0 END) as safe_stores,
    SUM(CASE WHEN has_member_discount = true THEN 1 ELSE 0 END) as discount_stores
FROM stores;
