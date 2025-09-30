-- =====================================================
-- 進一步優化：意圖查詢層快取 + FAQ 模糊比對 + COVERAGE_STATS 增強
-- =====================================================

-- 1. 創建查詢快取表（使用 Deno KV 或 Edge Memory 的替代方案）
CREATE TABLE IF NOT EXISTS public.query_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  intent TEXT NOT NULL,
  category TEXT,
  cached_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 2. 創建快取索引
CREATE INDEX IF NOT EXISTS idx_query_cache_key ON public.query_cache (cache_key);
CREATE INDEX IF NOT EXISTS idx_query_cache_expires ON public.query_cache (expires_at);

-- 3. 創建 FAQ 同義詞表
CREATE TABLE IF NOT EXISTS public.faq_synonyms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_term TEXT NOT NULL,
  synonym TEXT NOT NULL,
  weight DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 插入常見同義詞
INSERT INTO public.faq_synonyms (original_term, synonym, weight) VALUES
('停車費', '收費', 0.9),
('停車費', '價錢', 0.8),
('停車費', '費用', 0.9),
('停車場', '停車', 0.8),
('停車場', '車位', 0.7),
('餐廳', '美食', 0.9),
('餐廳', '餐飲', 0.8),
('餐廳', '吃飯', 0.7),
('推薦', '介紹', 0.8),
('推薦', '建議', 0.7),
('附近', '周邊', 0.8),
('附近', '旁邊', 0.7)
ON CONFLICT DO NOTHING;

-- 5. 創建同義詞索引
CREATE INDEX IF NOT EXISTS idx_faq_synonyms_original ON public.faq_synonyms (original_term);
CREATE INDEX IF NOT EXISTS idx_faq_synonyms_synonym ON public.faq_synonyms (synonym);

-- 6. 創建各分類統計視圖
CREATE OR REPLACE VIEW public.category_stats AS
SELECT 
  category,
  COUNT(*) as total_stores,
  COUNT(CASE WHEN is_trusted = true THEN 1 END) as trusted_stores,
  COUNT(CASE WHEN is_partner_store = true THEN 1 END) as partner_stores,
  ROUND(AVG(rating), 2) as avg_rating
FROM public.stores 
WHERE approval = 'approved'
GROUP BY category
ORDER BY total_stores DESC;

-- 7. 創建分類統計索引
CREATE INDEX IF NOT EXISTS idx_stores_category_stats ON public.stores (approval, category, is_trusted, is_partner_store, rating);

-- 8. 清理過期快取的函數
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.query_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 9. 創建快取統計視圖
CREATE OR REPLACE VIEW public.cache_stats AS
SELECT 
  intent,
  category,
  COUNT(*) as cache_entries,
  COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_entries,
  MIN(created_at) as oldest_entry,
  MAX(created_at) as newest_entry
FROM public.query_cache
GROUP BY intent, category
ORDER BY cache_entries DESC;
