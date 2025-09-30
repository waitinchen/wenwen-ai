// 手動創建標籤相關表結構
console.log('🗄️ 手動創建標籤相關表結構...')

async function createTagsTablesManually() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('📊 檢查現有表結構...')
    
    // 1. 檢查 tags 表
    try {
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .limit(1)
      
      if (tagsError) {
        console.log('❌ tags 表不存在，需要創建')
        console.log('💡 請在 Supabase Dashboard 中手動執行以下 SQL:')
        console.log(`
CREATE TABLE IF NOT EXISTS public.tags (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    tag_group VARCHAR(50) NOT NULL,
    synonyms TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_group ON public.tags(tag_group);
CREATE INDEX IF NOT EXISTS idx_tags_active ON public.tags(is_active);
        `)
      } else {
        console.log('✅ tags 表已存在')
      }
    } catch (e) {
      console.log('❌ tags 表檢查失敗')
    }
    
    // 2. 檢查 store_tags 表
    try {
      const { data: storeTagsData, error: storeTagsError } = await supabase
        .from('store_tags')
        .select('*')
        .limit(1)
      
      if (storeTagsError) {
        console.log('❌ store_tags 表不存在，需要創建')
        console.log('💡 請在 Supabase Dashboard 中手動執行以下 SQL:')
        console.log(`
CREATE TABLE IF NOT EXISTS public.store_tags (
    id SERIAL PRIMARY KEY,
    store_id INTEGER NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    confidence DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_store_tags_store_id ON public.store_tags(store_id);
CREATE INDEX IF NOT EXISTS idx_store_tags_tag_id ON public.store_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_store_tags_confidence ON public.store_tags(confidence);
        `)
      } else {
        console.log('✅ store_tags 表已存在')
      }
    } catch (e) {
      console.log('❌ store_tags 表檢查失敗')
    }
    
    // 3. 檢查 tag_groups 表
    try {
      const { data: tagGroupsData, error: tagGroupsError } = await supabase
        .from('tag_groups')
        .select('*')
        .limit(1)
      
      if (tagGroupsError) {
        console.log('❌ tag_groups 表不存在，需要創建')
        console.log('💡 請在 Supabase Dashboard 中手動執行以下 SQL:')
        console.log(`
CREATE TABLE IF NOT EXISTS public.tag_groups (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
        `)
      } else {
        console.log('✅ tag_groups 表已存在')
      }
    } catch (e) {
      console.log('❌ tag_groups 表檢查失敗')
    }
    
    console.log('\n📋 手動創建步驟:')
    console.log('1. 前往 Supabase Dashboard')
    console.log('2. 進入 SQL Editor')
    console.log('3. 執行上述 SQL 語句')
    console.log('4. 確認表創建成功')
    console.log('5. 運行初始化數據腳本')
    
    // 4. 提供初始化數據
    console.log('\n🗃️ 初始化標籤數據:')
    console.log('創建表後，請執行以下 SQL 來初始化數據:')
    
    const initDataSQL = `
-- 初始化標籤分組
INSERT INTO public.tag_groups (slug, display_name, description, sort_order) VALUES
('cuisine', '料理類型', '餐廳的主要料理類型', 1),
('service', '服務類型', '提供的服務項目', 2),
('price', '價格區間', '價格定位', 3),
('feature', '特色亮點', '商家特色和亮點', 4),
('target', '目標客群', '主要服務對象', 5),
('schedule', '營業時間', '營業時間相關', 6),
('atmosphere', '氛圍', '環境氛圍', 7)
ON CONFLICT (slug) DO NOTHING;

-- 初始化標籤數據
INSERT INTO public.tags (slug, display_name, tag_group, synonyms) VALUES
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
('delivery', '外送', 'service', ARRAY['外送服務']),
('takeout', '外帶', 'service', ARRAY['外帶服務']),
('dine-in', '內用', 'service', ARRAY['內用服務', '內用']),
('reservation', '預約', 'service', ARRAY['預約服務', '訂位']),
('parking', '停車', 'service', ARRAY['停車場', '停車服務']),
('wifi', 'WiFi', 'service', ARRAY['無線網路', '上網']),
('budget', '平價', 'price', ARRAY['便宜', '經濟實惠', '學生價位']),
('mid-range', '中等價位', 'price', ARRAY['中價位', '一般價位']),
('premium', '高檔', 'price', ARRAY['高價位', '奢華', '高級']),
('fresh', '新鮮現做', 'feature', ARRAY['新鮮', '現做']),
('handmade', '手作', 'feature', ARRAY['手工', '手工製作']),
('healthy', '健康', 'feature', ARRAY['健康料理', '養生']),
('instagram-worthy', '網美', 'feature', ARRAY['打卡', '拍照', 'IG']),
('family-kids', '親子', 'target', ARRAY['親子友善', '適合家庭']),
('couples', '情侶', 'target', ARRAY['約會', '浪漫']),
('students', '學生', 'target', ARRAY['學生族群']),
('breakfast', '早餐', 'schedule', ARRAY['早午餐']),
('lunch', '午餐', 'schedule', ARRAY['中午']),
('dinner', '晚餐', 'schedule', ARRAY['晚上']),
('late-night', '宵夜', 'schedule', ARRAY['深夜', '夜間'])
ON CONFLICT (slug) DO NOTHING;
    `
    
    console.log(initDataSQL)
    
    console.log('\n🎯 完成後，我們將:')
    console.log('1. 遷移現有的 features.tags 數據到新表結構')
    console.log('2. 實現 Required/Optional 標籤邏輯')
    console.log('3. 更新 admin 介面')
    console.log('4. 測試新的標籤匹配系統')
    
  } catch (error) {
    console.error('❌ 創建表結構異常:', error)
  }
}

createTagsTablesManually()

