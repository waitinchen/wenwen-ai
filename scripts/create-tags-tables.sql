-- 多標籤系統資料庫表結構創建腳本
-- 執行順序：tag_groups -> tags -> store_tags

-- 1. 創建標籤分組表
CREATE TABLE IF NOT EXISTS tag_groups (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 創建標籤主表
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    tag_group_id INTEGER REFERENCES tag_groups(id) ON DELETE SET NULL,
    synonyms TEXT[], -- 同義詞陣列
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 創建商家標籤關聯表
CREATE TABLE IF NOT EXISTS store_tags (
    id SERIAL PRIMARY KEY,
    store_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    confidence DECIMAL(3,2) DEFAULT 1.00, -- 0.00-1.00 信心度
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, tag_id)
);

-- 4. 創建索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_group_id ON tags(tag_group_id);
CREATE INDEX IF NOT EXISTS idx_tags_active ON tags(is_active);
CREATE INDEX IF NOT EXISTS idx_store_tags_store_id ON store_tags(store_id);
CREATE INDEX IF NOT EXISTS idx_store_tags_tag_id ON store_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_store_tags_confidence ON store_tags(confidence);
CREATE INDEX IF NOT EXISTS idx_tag_groups_slug ON tag_groups(slug);
CREATE INDEX IF NOT EXISTS idx_tag_groups_active ON tag_groups(is_active);

-- 5. 插入初始標籤分組數據
INSERT INTO tag_groups (slug, display_name, description, sort_order) VALUES
('cuisine', '料理類型', '餐廳的料理風格和類型', 1),
('service', '服務特色', '商家提供的特殊服務', 2),
('atmosphere', '氛圍特色', '店家的環境氛圍和風格', 3),
('price', '價格區間', '價格定位和消費水準', 4),
('facility', '設施設備', '店家的硬體設施和設備', 5),
('target', '目標客群', '主要服務的客群類型', 6)
ON CONFLICT (slug) DO NOTHING;

-- 6. 插入初始標籤數據
INSERT INTO tags (slug, display_name, tag_group_id, synonyms) VALUES
-- 料理類型標籤
('japanese', '日式料理', (SELECT id FROM tag_groups WHERE slug = 'cuisine'), ARRAY['日料', '日本料理', '和食']),
('korean', '韓式料理', (SELECT id FROM tag_groups WHERE slug = 'cuisine'), ARRAY['韓料', '韓國料理']),
('thai', '泰式料理', (SELECT id FROM tag_groups WHERE slug = 'cuisine'), ARRAY['泰料', '泰國料理']),
('chinese', '中式料理', (SELECT id FROM tag_groups WHERE slug = 'cuisine'), ARRAY['中華料理', '台菜', '川菜']),
('italian', '義式料理', (SELECT id FROM tag_groups WHERE slug = 'cuisine'), ARRAY['義大利料理']),
('vegetarian', '素食', (SELECT id FROM tag_groups WHERE slug = 'cuisine'), ARRAY['蔬食', '素食餐廳']),
('ramen', '拉麵', (SELECT id FROM tag_groups WHERE slug = 'cuisine'), ARRAY['日式拉麵']),
('sushi', '壽司', (SELECT id FROM tag_groups WHERE slug = 'cuisine'), ARRAY['生魚片']),
('hotpot', '火鍋', (SELECT id FROM tag_groups WHERE slug = 'cuisine'), ARRAY['麻辣鍋', '涮涮鍋']),
('bbq', '燒烤', (SELECT id FROM tag_groups WHERE slug = 'cuisine'), ARRAY['烤肉']),
('coffee', '咖啡', (SELECT id FROM tag_groups WHERE slug = 'cuisine'), ARRAY['咖啡廳', '手沖咖啡']),
('dessert', '甜點', (SELECT id FROM tag_groups WHERE slug = 'cuisine'), ARRAY['蛋糕', '烘焙', '冰淇淋']),

-- 服務特色標籤
('delivery', '外送', (SELECT id FROM tag_groups WHERE slug = 'service'), ARRAY['外賣']),
('takeout', '外帶', (SELECT id FROM tag_groups WHERE slug = 'service'), ARRAY['打包']),
('dine_in', '內用', (SELECT id FROM tag_groups WHERE slug = 'service'), ARRAY['內用', '堂食']),
('parking', '停車', (SELECT id FROM tag_groups WHERE slug = 'service'), ARRAY['停車場']),
('wifi', 'WiFi', (SELECT id FROM tag_groups WHERE slug = 'service'), ARRAY['無線網路']),
('24hours', '24小時', (SELECT id FROM tag_groups WHERE slug = 'service'), ARRAY['全天候']),
('reservation', '預約', (SELECT id FROM tag_groups WHERE slug = 'service'), ARRAY['訂位']),
('late_night', '宵夜', (SELECT id FROM tag_groups WHERE slug = 'service'), ARRAY['深夜']),

-- 氛圍特色標籤
('family_friendly', '親子友善', (SELECT id FROM tag_groups WHERE slug = 'atmosphere'), ARRAY['適合家庭', '親子']),
('student_friendly', '學生友善', (SELECT id FROM tag_groups WHERE slug = 'atmosphere'), ARRAY['學生']),
('romantic', '浪漫', (SELECT id FROM tag_groups WHERE slug = 'atmosphere'), ARRAY['情侶']),
('business', '商務', (SELECT id FROM tag_groups WHERE slug = 'atmosphere'), ARRAY['會議', '洽公']),
('casual', '休閒', (SELECT id FROM tag_groups WHERE slug = 'atmosphere'), ARRAY['放鬆']),
('instagram', '網美', (SELECT id FROM tag_groups WHERE slug = 'atmosphere'), ARRAY['打卡', '拍照']),

-- 價格區間標籤
('budget', '平價', (SELECT id FROM tag_groups WHERE slug = 'price'), ARRAY['便宜', '經濟實惠']),
('mid_range', '中價位', (SELECT id FROM tag_groups WHERE slug = 'price'), ARRAY['中等']),
('premium', '高檔', (SELECT id FROM tag_groups WHERE slug = 'price'), ARRAY['高級', '奢華']),

-- 設施設備標籤
('air_conditioning', '冷氣', (SELECT id FROM tag_groups WHERE slug = 'facility'), ARRAY['空調']),
('outdoor_seating', '戶外座位', (SELECT id FROM tag_groups WHERE slug = 'facility'), ARRAY['露天']),
('private_room', '包廂', (SELECT id FROM tag_groups WHERE slug = 'facility'), ARRAY['獨立空間']),

-- 目標客群標籤
('elderly_friendly', '長者友善', (SELECT id FROM tag_groups WHERE slug = 'target'), ARRAY['銀髮族']),
('pet_friendly', '寵物友善', (SELECT id FROM tag_groups WHERE slug = 'target'), ARRAY['可帶寵物']),
('wheelchair_accessible', '無障礙', (SELECT id FROM tag_groups WHERE slug = 'target'), ARRAY['輪椅友善'])
ON CONFLICT (slug) DO NOTHING;

-- 7. 創建更新時間的觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tag_groups_updated_at BEFORE UPDATE ON tag_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. 創建查詢統計的視圖
CREATE OR REPLACE VIEW store_tag_stats AS
SELECT 
    s.id as store_id,
    s.store_name,
    COUNT(st.tag_id) as tag_count,
    STRING_AGG(t.display_name, ', ' ORDER BY tg.sort_order, t.display_name) as tags_display
FROM stores s
LEFT JOIN store_tags st ON s.id = st.store_id
LEFT JOIN tags t ON st.tag_id = t.id
LEFT JOIN tag_groups tg ON t.tag_group_id = tg.id
WHERE s.approval = 'approved'
GROUP BY s.id, s.store_name;

-- 完成提示
SELECT '多標籤系統資料庫表結構創建完成！' as status;
