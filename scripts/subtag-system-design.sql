-- 完整子標籤方案設計
-- 解決特定料理類型識別問題

-- ===== 方案一：商家子標籤表 =====
CREATE TABLE IF NOT EXISTS store_subtags (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  subtag_type VARCHAR(50) NOT NULL,  -- 'cuisine', 'service', 'feature'
  subtag_value VARCHAR(100) NOT NULL, -- '日式料理', '韓式料理', '24小時'
  confidence_score DECIMAL(3,2) DEFAULT 1.0, -- 信心分數
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_store_subtags_store_id ON store_subtags(store_id);
CREATE INDEX IF NOT EXISTS idx_store_subtags_type_value ON store_subtags(subtag_type, subtag_value);

-- ===== 方案二：商家特徵標籤表 =====
CREATE TABLE IF NOT EXISTS store_features (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  feature_category VARCHAR(50) NOT NULL,  -- 'cuisine', 'service', 'amenity'
  feature_name VARCHAR(100) NOT NULL,     -- '日式料理', '韓式料理', '免費WiFi'
  feature_value TEXT,                     -- 詳細描述或值
  is_primary BOOLEAN DEFAULT false,       -- 是否為主要特徵
  display_order INTEGER DEFAULT 0,        -- 顯示順序
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_store_features_store_id ON store_features(store_id);
CREATE INDEX IF NOT EXISTS idx_store_features_category ON store_features(feature_category);
CREATE INDEX IF NOT EXISTS idx_store_features_name ON store_features(feature_name);

-- ===== 方案三：關鍵字映射表 =====
CREATE TABLE IF NOT EXISTS cuisine_keywords (
  id SERIAL PRIMARY KEY,
  cuisine_type VARCHAR(50) NOT NULL,      -- '日式料理', '韓式料理'
  keyword VARCHAR(100) NOT NULL,          -- 關鍵字
  keyword_type VARCHAR(20) DEFAULT 'exact', -- 'exact', 'partial', 'synonym'
  weight DECIMAL(3,2) DEFAULT 1.0,        -- 權重
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入常見料理關鍵字
INSERT INTO cuisine_keywords (cuisine_type, keyword, keyword_type, weight) VALUES
-- 日式料理關鍵字
('日式料理', '日式', 'exact', 1.0),
('日式料理', '日料', 'exact', 1.0),
('日式料理', '壽司', 'exact', 1.0),
('日式料理', '拉麵', 'exact', 1.0),
('日式料理', '和食', 'exact', 1.0),
('日式料理', '天婦羅', 'exact', 1.0),
('日式料理', '居酒屋', 'exact', 1.0),
('日式料理', '燒肉', 'exact', 1.0),
('日式料理', '丼飯', 'exact', 1.0),
('日式料理', '日', 'partial', 0.7),

-- 韓式料理關鍵字
('韓式料理', '韓式', 'exact', 1.0),
('韓式料理', '韓料', 'exact', 1.0),
('韓式料理', '烤肉', 'exact', 1.0),
('韓式料理', '泡菜', 'exact', 1.0),
('韓式料理', '石鍋', 'exact', 1.0),
('韓式料理', '韓', 'partial', 0.7),
('韓式料理', '韓國', 'exact', 1.0),

-- 泰式料理關鍵字
('泰式料理', '泰式', 'exact', 1.0),
('泰式料理', '泰料', 'exact', 1.0),
('泰式料理', '冬陰功', 'exact', 1.0),
('泰式料理', '綠咖喱', 'exact', 1.0),
('泰式料理', '泰', 'partial', 0.7),

-- 義式料理關鍵字
('義式料理', '義式', 'exact', 1.0),
('義式料理', '義大利', 'exact', 1.0),
('義式料理', '披薩', 'exact', 1.0),
('義式料理', '義大利麵', 'exact', 1.0),
('義式料理', '義', 'partial', 0.7),

-- 中式料理關鍵字
('中式料理', '中式', 'exact', 1.0),
('中式料理', '火鍋', 'exact', 1.0),
('中式料理', '川菜', 'exact', 1.0),
('中式料理', '台菜', 'exact', 1.0),
('中式料理', '中', 'partial', 0.7),

-- 素食關鍵字
('素食', '素食', 'exact', 1.0),
('素食', '蔬食', 'exact', 1.0),
('素食', '素食餐廳', 'exact', 1.0),
('素食', '蔬食餐廳', 'exact', 1.0);

-- ===== 創建查詢視圖 =====
CREATE OR REPLACE VIEW store_cuisine_view AS
SELECT 
  s.id,
  s.store_name,
  s.address,
  s.category,
  s.rating,
  s.is_partner_store,
  s.sponsorship_tier,
  -- 從 store_subtags 獲取料理類型
  COALESCE(
    STRING_AGG(DISTINCT st.subtag_value, ', ' ORDER BY st.subtag_value),
    '未分類'
  ) as cuisine_types,
  -- 從 store_features 獲取特徵
  COALESCE(
    STRING_AGG(DISTINCT sf.feature_name, ', ' ORDER BY sf.feature_name),
    ''
  ) as features
FROM stores s
LEFT JOIN store_subtags st ON s.id = st.store_id AND st.subtag_type = 'cuisine'
LEFT JOIN store_features sf ON s.id = sf.store_id AND sf.feature_category = 'cuisine'
WHERE s.approval = 'approved'
GROUP BY s.id, s.store_name, s.address, s.category, s.rating, s.is_partner_store, s.sponsorship_tier;

-- ===== 創建料理類型檢測函數 =====
CREATE OR REPLACE FUNCTION detect_cuisine_type(
  store_name TEXT,
  store_category TEXT,
  store_features TEXT
) RETURNS TEXT[] AS $$
DECLARE
  detected_cuisines TEXT[] := '{}';
  keyword_record RECORD;
  search_text TEXT;
BEGIN
  -- 組合搜尋文字
  search_text := LOWER(COALESCE(store_name, '') || ' ' || 
                      COALESCE(store_category, '') || ' ' || 
                      COALESCE(store_features, ''));
  
  -- 檢查每個關鍵字
  FOR keyword_record IN 
    SELECT DISTINCT cuisine_type, keyword, weight
    FROM cuisine_keywords
    ORDER BY weight DESC
  LOOP
    -- 精確匹配
    IF keyword_record.keyword_type = 'exact' AND 
       search_text LIKE '%' || keyword_record.keyword || '%' THEN
      detected_cuisines := array_append(detected_cuisines, keyword_record.cuisine_type);
    -- 部分匹配
    ELSIF keyword_record.keyword_type = 'partial' AND 
          search_text LIKE '%' || keyword_record.keyword || '%' THEN
      detected_cuisines := array_append(detected_cuisines, keyword_record.cuisine_type);
    END IF;
  END LOOP;
  
  -- 去重並返回
  RETURN ARRAY(SELECT DISTINCT unnest(detected_cuisines));
END;
$$ LANGUAGE plpgsql;

-- ===== 創建自動標籤更新觸發器 =====
CREATE OR REPLACE FUNCTION update_store_cuisine_tags() RETURNS TRIGGER AS $$
DECLARE
  detected_cuisines TEXT[];
  cuisine_type TEXT;
BEGIN
  -- 刪除現有的料理標籤
  DELETE FROM store_subtags WHERE store_id = NEW.id AND subtag_type = 'cuisine';
  
  -- 檢測料理類型
  detected_cuisines := detect_cuisine_type(NEW.store_name, NEW.category, NEW.features);
  
  -- 插入新的料理標籤
  FOREACH cuisine_type IN ARRAY detected_cuisines
  LOOP
    INSERT INTO store_subtags (store_id, subtag_type, subtag_value, confidence_score)
    VALUES (NEW.id, 'cuisine', cuisine_type, 1.0);
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 創建觸發器
DROP TRIGGER IF EXISTS trigger_update_cuisine_tags ON stores;
CREATE TRIGGER trigger_update_cuisine_tags
  AFTER INSERT OR UPDATE OF store_name, category, features ON stores
  FOR EACH ROW EXECUTE FUNCTION update_store_cuisine_tags();

-- ===== 測試查詢 =====
-- 查詢所有日式料理商家
-- SELECT * FROM store_cuisine_view WHERE cuisine_types LIKE '%日式料理%';

-- 查詢所有韓式料理商家  
-- SELECT * FROM store_cuisine_view WHERE cuisine_types LIKE '%韓式料理%';

-- 使用函數檢測特定商家的料理類型
-- SELECT store_name, detect_cuisine_type(store_name, category, features) as detected_cuisines 
-- FROM stores WHERE approval = 'approved';

COMMENT ON TABLE store_subtags IS '商家子標籤表 - 支援多層級標籤分類';
COMMENT ON TABLE store_features IS '商家特徵表 - 詳細特徵描述';
COMMENT ON TABLE cuisine_keywords IS '料理關鍵字映射表 - 支援智能識別';
COMMENT ON VIEW store_cuisine_view IS '商家料理視圖 - 整合查詢視圖';
COMMENT ON FUNCTION detect_cuisine_type IS '料理類型檢測函數 - 自動識別料理類型';
