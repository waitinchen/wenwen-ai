-- 商家多標籤系統資料庫結構設計
-- 根據技術指導信要求設計

-- ===== 標籤主表 (tags) =====
CREATE TABLE IF NOT EXISTS public.tags (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,           -- 標籤唯一識別碼 (如: japanese, wifi, family-friendly)
    display_name VARCHAR(100) NOT NULL,         -- 顯示名稱 (如: 日式料理, WiFi, 親子友善)
    tag_group VARCHAR(50) NOT NULL,             -- 標籤分組 (cuisine, service, price, vibe, etc.)
    synonyms TEXT[],                            -- 同義詞陣列 (如: ['日式', '日本料理', '和食'])
    is_active BOOLEAN DEFAULT TRUE,             -- 是否啟用
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_group ON public.tags(tag_group);
CREATE INDEX IF NOT EXISTS idx_tags_active ON public.tags(is_active);

-- ===== 商家標籤關聯表 (store_tags) =====
CREATE TABLE IF NOT EXISTS public.store_tags (
    id SERIAL PRIMARY KEY,
    store_id INTEGER NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    confidence DECIMAL(3,2) DEFAULT 1.0,        -- 標籤信心度 (0.0-1.0)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, tag_id)                    -- 防止重複標籤
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_store_tags_store_id ON public.store_tags(store_id);
CREATE INDEX IF NOT EXISTS idx_store_tags_tag_id ON public.store_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_store_tags_confidence ON public.store_tags(confidence);

-- ===== 標籤分組配置表 (tag_groups) =====
CREATE TABLE IF NOT EXISTS public.tag_groups (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,           -- 分組識別碼
    display_name VARCHAR(100) NOT NULL,         -- 分組顯示名稱
    description TEXT,                           -- 分組描述
    sort_order INTEGER DEFAULT 0,              -- 排序順序
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== 初始化標籤分組數據 =====
INSERT INTO public.tag_groups (slug, display_name, description, sort_order) VALUES
('cuisine', '料理類型', '餐廳的主要料理類型', 1),
('service', '服務類型', '提供的服務項目', 2),
('price', '價格區間', '價格定位', 3),
('feature', '特色亮點', '商家特色和亮點', 4),
('target', '目標客群', '主要服務對象', 5),
('schedule', '營業時間', '營業時間相關', 6),
('atmosphere', '氛圍', '環境氛圍', 7)
ON CONFLICT (slug) DO NOTHING;

-- ===== 初始化標籤數據 =====
INSERT INTO public.tags (slug, display_name, tag_group, synonyms) VALUES
-- 料理類型標籤
('japanese', '日式料理', 'cuisine', ARRAY['日式', '日本料理', '和食', '日料']),
('korean', '韓式料理', 'cuisine', ARRAY['韓式', '韓國料理', '韓料']),
('thai', '泰式料理', 'cuisine', ARRAY['泰式', '泰國料理', '泰料']),
('italian', '義式料理', 'cuisine', ARRAY['義式', '義大利料理', '義大利']),
('chinese', '中式料理', 'cuisine', ARRAY['中式', '中華料理', '中菜']),
('vegetarian', '素食', 'cuisine', ARRAY['蔬食', '素食餐廳']),
('hotpot', '火鍋', 'cuisine', ARRAY['火鍋店', '涮涮鍋']),
('bbq', '燒烤', 'cuisine', ARRAY['烤肉', '燒肉']),
('dessert', '甜點', 'cuisine', ARRAY['蛋糕', '烘焙', '甜點店']),
('coffee', '咖啡', 'cuisine', ARRAY['咖啡廳', '咖啡店']),

-- 服務類型標籤
('delivery', '外送', 'service', ARRAY['外送服務']),
('takeout', '外帶', 'service', ARRAY['外帶服務']),
('dine-in', '內用', 'service', ARRAY['內用服務', '內用']),
('reservation', '預約', 'service', ARRAY['預約服務', '訂位']),
('parking', '停車', 'service', ARRAY['停車場', '停車服務']),
('wifi', 'WiFi', 'service', ARRAY['無線網路', '上網']),
('air-conditioning', '冷氣', 'service', ARRAY['空調', '冷氣空調']),
('child-friendly', '兒童友善', 'service', ARRAY['親子友善', '適合兒童']),
('pet-friendly', '寵物友善', 'service', ARRAY['可帶寵物']),
('accessible', '無障礙', 'service', ARRAY['無障礙設施']),
('24hours', '24小時', 'service', ARRAY['全天營業']),

-- 價格區間標籤
('budget', '平價', 'price', ARRAY['便宜', '經濟實惠', '學生價位']),
('mid-range', '中等價位', 'price', ARRAY['中價位', '一般價位']),
('premium', '高檔', 'price', ARRAY['高價位', '奢華', '高級']),
('student-friendly', '學生友善', 'price', ARRAY['學生優惠', '學生價']),
('family', '家庭聚餐', 'price', ARRAY['適合家庭', '家庭餐廳']),

-- 特色亮點標籤
('fresh', '新鮮現做', 'feature', ARRAY['新鮮', '現做']),
('handmade', '手作', 'feature', ARRAY['手工', '手工製作']),
('organic', '有機', 'feature', ARRAY['有機食材']),
('healthy', '健康', 'feature', ARRAY['健康料理', '養生']),
('traditional', '傳統', 'feature', ARRAY['傳統料理', '古早味']),
('innovative', '創新', 'feature', ARRAY['創意料理', '新穎']),
('instagram-worthy', '網美', 'feature', ARRAY['打卡', '拍照', 'IG']),
('decor', '特色裝潢', 'feature', ARRAY['裝潢', '設計感']),

-- 目標客群標籤
('family-kids', '親子', 'target', ARRAY['親子友善', '適合家庭']),
('couples', '情侶', 'target', ARRAY['約會', '浪漫']),
('friends', '朋友', 'target', ARRAY['聚餐', '聚會']),
('students', '學生', 'target', ARRAY['學生族群']),
('business', '商務', 'target', ARRAY['商務客', '上班族']),
('tourists', '觀光客', 'target', ARRAY['觀光', '遊客']),
('locals', '在地人', 'target', ARRAY['在地', '本地']),

-- 營業時間標籤
('breakfast', '早餐', 'schedule', ARRAY['早午餐']),
('lunch', '午餐', 'schedule', ARRAY['中午']),
('afternoon-tea', '下午茶', 'schedule', ARRAY['午茶']),
('dinner', '晚餐', 'schedule', ARRAY['晚上']),
('late-night', '宵夜', 'schedule', ARRAY['深夜', '夜間']),
('weekend-only', '週末限定', 'schedule', ARRAY['週末']),
('weekday-only', '平日限定', 'schedule', ARRAY['平日'])
ON CONFLICT (slug) DO NOTHING;

-- ===== 創建視圖：商家標籤詳情 =====
CREATE OR REPLACE VIEW public.store_tag_details AS
SELECT 
    s.id as store_id,
    s.store_name,
    s.category,
    t.id as tag_id,
    t.slug as tag_slug,
    t.display_name as tag_name,
    t.tag_group,
    st.confidence,
    st.created_at as tag_assigned_at
FROM public.stores s
LEFT JOIN public.store_tags st ON s.id = st.store_id
LEFT JOIN public.tags t ON st.tag_id = t.id
WHERE s.approval = 'approved' AND t.is_active = true;

-- ===== 創建函數：根據標籤查詢商家 =====
CREATE OR REPLACE FUNCTION public.search_stores_by_tags(
    required_tags TEXT[] DEFAULT NULL,
    optional_tags TEXT[] DEFAULT NULL,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(
    store_id INTEGER,
    store_name TEXT,
    category TEXT,
    matched_required_tags TEXT[],
    matched_optional_tags TEXT[],
    match_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH required_matches AS (
        SELECT st.store_id, COUNT(*) as required_count
        FROM public.store_tags st
        JOIN public.tags t ON st.tag_id = t.id
        WHERE t.slug = ANY(required_tags)
        GROUP BY st.store_id
    ),
    optional_matches AS (
        SELECT st.store_id, COUNT(*) as optional_count
        FROM public.store_tags st
        JOIN public.tags t ON st.tag_id = t.id
        WHERE t.slug = ANY(optional_tags)
        GROUP BY st.store_id
    ),
    combined_matches AS (
        SELECT 
            s.id as store_id,
            s.store_name,
            s.category,
            COALESCE(rm.required_count, 0) as required_matches,
            COALESCE(om.optional_count, 0) as optional_matches,
            (COALESCE(rm.required_count, 0) * 10 + COALESCE(om.optional_count, 0)) as match_score
        FROM public.stores s
        LEFT JOIN required_matches rm ON s.id = rm.store_id
        LEFT JOIN optional_matches om ON s.id = om.store_id
        WHERE s.approval = 'approved'
        AND (required_tags IS NULL OR rm.required_count = array_length(required_tags, 1))
    )
    SELECT 
        cm.store_id,
        cm.store_name,
        cm.category,
        ARRAY[]::TEXT[] as matched_required_tags, -- 簡化版，實際可展開
        ARRAY[]::TEXT[] as matched_optional_tags, -- 簡化版，實際可展開
        cm.match_score
    FROM combined_matches cm
    WHERE cm.match_score > 0
    ORDER BY cm.match_score DESC, cm.store_name
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ===== 添加註釋 =====
COMMENT ON TABLE public.tags IS '標籤主表：集中管理所有標籤';
COMMENT ON TABLE public.store_tags IS '商家標籤關聯表：多對多關係';
COMMENT ON TABLE public.tag_groups IS '標籤分組配置表';
COMMENT ON VIEW public.store_tag_details IS '商家標籤詳情視圖';
COMMENT ON FUNCTION public.search_stores_by_tags IS '根據標籤搜尋商家的函數';

-- ===== 權限設置 =====
-- 允許服務角色讀寫
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_tags TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tag_groups TO service_role;
GRANT SELECT ON public.store_tag_details TO service_role;
GRANT EXECUTE ON FUNCTION public.search_stores_by_tags TO service_role;

-- 允許認證用戶讀取
GRANT SELECT ON public.tags TO authenticated;
GRANT SELECT ON public.store_tags TO authenticated;
GRANT SELECT ON public.tag_groups TO authenticated;
GRANT SELECT ON public.store_tag_details TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_stores_by_tags TO authenticated;

