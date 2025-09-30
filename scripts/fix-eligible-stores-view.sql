-- 修復 eligible_stores 視圖依賴問題
-- 先刪除依賴的視圖，修改欄位類型，然後重建視圖

-- 1. 檢查並刪除 eligible_stores 視圖
drop view if exists public.eligible_stores;

-- 2. 現在可以安全地修改 features 欄位類型
do $$
begin
  -- 如果 features 不是 jsonb 類型，轉換它
  if exists (
    select 1 from information_schema.columns 
    where table_name='stores' and column_name='features' 
    and data_type != 'jsonb'
  ) then
    alter table public.stores alter column features type jsonb using features::jsonb;
    raise notice 'Successfully converted features column to jsonb';
  else
    raise notice 'Features column is already jsonb type';
  end if;
end
$$;

-- 3. 確保 GIN 索引存在
do $$
begin
  if not exists (
    select 1 from pg_indexes 
    where tablename='stores' and indexname='idx_stores_features_gin'
  ) then
    create index idx_stores_features_gin on public.stores using gin (features);
    raise notice 'Created GIN index for features column';
  else
    raise notice 'GIN index for features already exists';
  end if;
end
$$;

-- 4. 重建 eligible_stores 視圖（如果需要的話）
-- 注意：我們需要知道原始視圖的定義，這裡提供一個常見的版本
create or replace view public.eligible_stores as
select 
  id,
  store_name,
  category,
  address,
  approval,
  is_partner_store,
  sponsorship_tier,
  rating,
  store_code,
  features,
  has_member_discount,
  is_safe_store,
  business_hours,
  created_at
from public.stores
where approval = 'approved';

-- 5. 更新現有資料的 features 欄位格式
update public.stores 
set features = jsonb_strip_nulls(
  jsonb_build_object(
    'tags', COALESCE((features->'tags')::jsonb, '[]'::jsonb),
    'secondary_category', COALESCE((features->>'secondary_category')::text, ''),
    'description', COALESCE((features->>'description')::text, '')
  )
  || features
)
where features is not null;

-- 6. 為空 features 設置預設值
update public.stores 
set features = '{"tags": [], "secondary_category": "", "description": ""}'::jsonb
where features is null;

-- 7. 測試查詢
select 
  count(*) as total_stores,
  count(*) filter (where has_member_discount = true) as discount_stores,
  count(*) filter (where is_partner_store = true) as partner_stores,
  count(distinct category) as category_count
from public.stores;
