-- COVERAGE_STATS 為 0 的修復檢核
-- 執行前請備份數據庫

-- 1) 建欄（若不存在）
alter table public.stores
  add column if not exists is_safe_store boolean not null default false,
  add column if not exists has_member_discount boolean not null default false,
  add column if not exists is_partner_store boolean not null default false;

-- 2) 將既有資料的 null 改為 false（保險）
update public.stores set
  is_safe_store = coalesce(is_safe_store, false),
  has_member_discount = coalesce(has_member_discount, false),
  is_partner_store = coalesce(is_partner_store, false)
where is_safe_store is null or has_member_discount is null or is_partner_store is null;

-- 3) category 確保不是 null
update public.stores
set category = '未分類'
where category is null or category = '';

-- 4) 為 features 建 GIN 索引（若 features 存 JSONB）
create index if not exists idx_stores_features_gin on public.stores using gin ((features::jsonb));

-- 5) 為 category 與 store_name 建 BTREE 索引
create index if not exists idx_stores_category on public.stores (category);
create index if not exists idx_stores_store_name on public.stores (store_name);

-- 6) 快速檢查四個統計數字
select
  (select count(*) from public.stores)                                as total,
  (select count(*) from public.stores where is_safe_store = true)     as verified,
  (select count(*) from public.stores where has_member_discount=true) as discount,
  (select count(*) from public.stores where is_partner_store = true)  as partner,
  (select count(distinct category) from public.stores where category is not null and category != '') as categories;

-- 7) 檢查前 10 筆資料的欄位值
select 
  store_name,
  category,
  is_safe_store,
  has_member_discount,
  is_partner_store,
  features
from public.stores 
limit 10;
