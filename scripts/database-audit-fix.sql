-- WEN 1.1.6 資料庫全面審計與修復腳本
-- 執行日期: 2025-09-24
-- 目的: 修復 AI 幻覺問題，確保資料完整性

-- ===== 1. 資料庫審計 =====

-- 檢查商家總數
SELECT '總商家數' as 項目, COUNT(*) as 數量 FROM stores;

-- 檢查各類別商家分佈
SELECT '類別分佈' as 項目, category as 類別, COUNT(*) as 數量 
FROM stores 
GROUP BY category 
ORDER BY COUNT(*) DESC;

-- 檢查特約商家數量
SELECT '特約商家' as 項目, COUNT(*) as 數量 
FROM stores 
WHERE is_partner_store = true;

-- 檢查資料完整性
SELECT '資料完整性檢查' as 項目, 
       SUM(CASE WHEN store_name IS NULL OR store_name = '' THEN 1 ELSE 0 END) as 店名缺失,
       SUM(CASE WHEN category IS NULL OR category = '' THEN 1 ELSE 0 END) as 類別缺失,
       SUM(CASE WHEN address IS NULL OR address = '' THEN 1 ELSE 0 END) as 地址缺失,
       SUM(CASE WHEN phone IS NULL OR phone = '' THEN 1 ELSE 0 END) as 電話缺失
FROM stores;

-- ===== 2. 修復已知問題 =====

-- 修復肯塔基美語的 JSON 格式
UPDATE stores 
SET features = '{"description": "專業外師、小班制教學", "rating": 5, "open_status": "營業中"}'
WHERE store_name = '肯塔基美語' 
  AND (features IS NULL OR features = '' OR features LIKE '%專%');

-- 清理無效的 JSON 格式
UPDATE stores 
SET features = '{}'
WHERE features IS NOT NULL 
  AND features != '' 
  AND features NOT LIKE '{%}';

-- ===== 3. 資料標準化 =====

-- 標準化類別名稱
UPDATE stores SET category = '餐飲美食' WHERE category IN ('美食餐廳', '餐廳', '美食');
UPDATE stores SET category = '教育培訓' WHERE category IN ('教育', '培訓', '補習班');
UPDATE stores SET category = '停車場' WHERE category IN ('停車', '車位');

-- 清理空值和無效資料
UPDATE stores SET address = '地址請洽詢店家' WHERE address IS NULL OR address = '';
UPDATE stores SET phone = '電話請洽詢店家' WHERE phone IS NULL OR phone = '';
UPDATE stores SET business_hours = '營業時間請洽詢店家' WHERE business_hours IS NULL OR business_hours = '';

-- ===== 4. 建立防幻覺機制 =====

-- 建立商家驗證視圖
CREATE OR REPLACE VIEW verified_stores AS
SELECT 
    id,
    store_name,
    category,
    address,
    phone,
    business_hours,
    is_partner_store,
    features,
    rating,
    created_at,
    updated_at
FROM stores 
WHERE store_name IS NOT NULL 
  AND store_name != '' 
  AND category IS NOT NULL 
  AND category != ''
  AND store_name NOT IN (
    '鳳山牛肉麵', '山城小館', 'Coz Pizza', 
    '好客食堂', '福源小館', '阿村魯肉飯',
    '英文達人', '環球英語', '東門市場', '文山樓'
  );

-- ===== 5. 建立索引優化 =====

-- 建立類別索引
CREATE INDEX IF NOT EXISTS idx_stores_category ON stores(category);

-- 建立特約商家索引
CREATE INDEX IF NOT EXISTS idx_stores_partner ON stores(is_partner_store);

-- 建立複合索引
CREATE INDEX IF NOT EXISTS idx_stores_category_partner ON stores(category, is_partner_store);

-- ===== 6. 資料完整性檢查 =====

-- 最終檢查
SELECT 
    '修復後檢查' as 項目,
    COUNT(*) as 總商家數,
    COUNT(CASE WHEN category = '餐飲美食' THEN 1 END) as 餐飲美食,
    COUNT(CASE WHEN category = '教育培訓' THEN 1 END) as 教育培訓,
    COUNT(CASE WHEN category = '停車場' THEN 1 END) as 停車場,
    COUNT(CASE WHEN is_partner_store = true THEN 1 END) as 特約商家
FROM verified_stores;

-- ===== 7. 建立監控查詢 =====

-- 監控查詢：檢查空資料
SELECT '空資料監控' as 項目, COUNT(*) as 空資料數量
FROM stores 
WHERE store_name IS NULL OR store_name = '' 
   OR category IS NULL OR category = '';

-- 監控查詢：檢查 JSON 格式
SELECT 'JSON格式監控' as 項目, COUNT(*) as 無效JSON數量
FROM stores 
WHERE features IS NOT NULL 
  AND features != '' 
  AND features NOT LIKE '{%}';

-- ===== 8. 備份建議 =====
-- 執行前請先備份資料庫
-- pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql
