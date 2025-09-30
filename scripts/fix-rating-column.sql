-- 修復 rating 欄位缺失問題
-- 問題：stores 表沒有 rating 欄位，但視圖中引用了 s.rating
-- 解決：添加 rating 欄位到 stores 表

-- ===== 1. 添加 rating 欄位 =====
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS rating decimal(3,2) DEFAULT 0.0;

-- ===== 2. 創建 rating 索引 =====
CREATE INDEX IF NOT EXISTS idx_stores_rating ON stores (rating DESC NULLS LAST);

-- ===== 3. 為現有商家設置預設評分 =====
-- 特約商家設置較高評分
UPDATE stores SET rating = 4.5 WHERE is_partner_store = true AND rating = 0.0;

-- 肯塔基美語設置最高評分
UPDATE stores SET rating = 5.0 WHERE store_name LIKE '%肯塔基美語%';

-- 其他商家設置預設評分
UPDATE stores SET rating = 4.0 WHERE rating = 0.0;

-- ===== 完成 =====
-- rating 欄位已添加並設置預設值
