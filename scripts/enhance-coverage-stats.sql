-- =====================================================
-- COVERAGE_STATS 增強：各分類家數 Top 5
-- =====================================================

-- 1. 創建增強的統計查詢函數
CREATE OR REPLACE FUNCTION public.get_enhanced_coverage_stats()
RETURNS JSONB AS $$
DECLARE
  total_stores INTEGER;
  trusted_stores INTEGER;
  partner_stores INTEGER;
  total_categories INTEGER;
  category_top5 JSONB;
  last_updated TIMESTAMP WITH TIME ZONE;
  result JSONB;
BEGIN
  -- 基本統計
  SELECT 
    COUNT(*) INTO total_stores
  FROM public.stores 
  WHERE approval = 'approved';
  
  SELECT 
    COUNT(*) INTO trusted_stores
  FROM public.stores 
  WHERE approval = 'approved' AND is_trusted = true;
  
  SELECT 
    COUNT(*) INTO partner_stores
  FROM public.stores 
  WHERE approval = 'approved' AND is_partner_store = true;
  
  SELECT 
    COUNT(DISTINCT category) INTO total_categories
  FROM public.stores 
  WHERE approval = 'approved';
  
  -- 獲取最後更新時間
  SELECT 
    MAX(updated_at) INTO last_updated
  FROM public.stores 
  WHERE approval = 'approved';
  
  -- 各分類 Top 5
  SELECT 
    jsonb_agg(
      jsonb_build_object(
        'category', category,
        'count', store_count,
        'trusted_count', trusted_count,
        'partner_count', partner_count,
        'avg_rating', avg_rating
      )
    ) INTO category_top5
  FROM (
    SELECT 
      category,
      COUNT(*) as store_count,
      COUNT(CASE WHEN is_trusted = true THEN 1 END) as trusted_count,
      COUNT(CASE WHEN is_partner_store = true THEN 1 END) as partner_count,
      ROUND(AVG(rating), 2) as avg_rating
    FROM public.stores 
    WHERE approval = 'approved'
    GROUP BY category
    ORDER BY store_count DESC
    LIMIT 5
  ) top_categories;
  
  -- 構建結果
  result := jsonb_build_object(
    'total', total_stores,
    'verified', trusted_stores,
    'partner', partner_stores,
    'categories', total_categories,
    'last_updated', last_updated,
    'category_top5', category_top5
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 2. 創建增強的統計視圖
CREATE OR REPLACE VIEW public.enhanced_coverage_stats AS
SELECT 
  'basic_stats' as stat_type,
  jsonb_build_object(
    'total_stores', COUNT(*),
    'trusted_stores', COUNT(CASE WHEN is_trusted = true THEN 1 END),
    'partner_stores', COUNT(CASE WHEN is_partner_store = true THEN 1 END),
    'total_categories', COUNT(DISTINCT category),
    'last_updated', MAX(updated_at)
  ) as stats_data
FROM public.stores 
WHERE approval = 'approved'

UNION ALL

SELECT 
  'category_top5' as stat_type,
  jsonb_agg(
    jsonb_build_object(
      'category', category,
      'count', store_count,
      'trusted_count', trusted_count,
      'partner_count', partner_count,
      'avg_rating', avg_rating
    )
  ) as stats_data
FROM (
  SELECT 
    category,
    COUNT(*) as store_count,
    COUNT(CASE WHEN is_trusted = true THEN 1 END) as trusted_count,
    COUNT(CASE WHEN is_partner_store = true THEN 1 END) as partner_count,
    ROUND(AVG(rating), 2) as avg_rating
  FROM public.stores 
  WHERE approval = 'approved'
  GROUP BY category
  ORDER BY store_count DESC
  LIMIT 5
) top_categories;

-- 3. 測試增強的統計查詢
SELECT public.get_enhanced_coverage_stats() as enhanced_stats;

-- 4. 測試增強的統計視圖
SELECT * FROM public.enhanced_coverage_stats;
