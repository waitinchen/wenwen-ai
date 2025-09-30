-- =====================================================
-- 補丁二：features 統一用 JSONB + Tag 檢索加速（SQL）
-- =====================================================

-- 1) 確保 features 為 JSONB
ALTER TABLE public.stores
  ALTER COLUMN features TYPE jsonb
  USING CASE
    WHEN jsonb_typeof(features::jsonb) IS NOT NULL THEN features::jsonb
    WHEN features IS NULL OR features = '' THEN '{}'::jsonb
    ELSE '{}'::jsonb
  END;

-- 2) 統一 features 結構，至少包含 { "tags": [], "secondary_category": "" }
UPDATE public.stores
SET features = jsonb_strip_nulls(
  jsonb_build_object(
    'tags', COALESCE((features->'tags')::jsonb, '[]'::jsonb),
    'secondary_category', COALESCE((features->>'secondary_category')::text, '')
  )
  || features
)
WHERE true;

-- 3) GIN 索引：加速 tags/secondary_category 查詢
CREATE INDEX IF NOT EXISTS idx_stores_features_gin ON public.stores USING GIN (features);

-- 4) 常用排序條件的複合索引
CREATE INDEX IF NOT EXISTS idx_stores_approved_category_rank
  ON public.stores (approval, category, is_partner_store DESC, sponsorship_tier DESC, rating DESC);

-- 5) 其他統計/旗標類查詢索引
CREATE INDEX IF NOT EXISTS idx_stores_approved_trusted ON public.stores (approval, is_trusted);
CREATE INDEX IF NOT EXISTS idx_stores_approved_partner ON public.stores (approval, is_partner_store);

-- 6) 驗證優化結果
SELECT 
  'Features 欄位類型' as check_type,
  data_type as result
FROM information_schema.columns 
WHERE table_name = 'stores' AND column_name = 'features';

SELECT 
  'Features 結構範例' as check_type,
  features as result
FROM public.stores 
WHERE features IS NOT NULL 
LIMIT 3;

SELECT 
  '索引創建狀態' as check_type,
  indexname as result
FROM pg_indexes 
WHERE tablename = 'stores' 
  AND indexname LIKE '%features%' OR indexname LIKE '%approved%'
ORDER BY indexname;

-- 7) 性能測試查詢
EXPLAIN (ANALYZE, BUFFERS) 
SELECT store_name, category, features->'tags' as tags
FROM public.stores 
WHERE features @> '{"tags": ["日式料理"]}' 
  AND approval = 'approved'
ORDER BY is_partner_store DESC, rating DESC
LIMIT 10;
