-- 關鍵修復資料庫遷移SQL (安全版)
-- 修復12個高風險問題所需的資料庫結構
-- 處理視圖依賴問題

-- stores 基礎 + 我方用到的欄位
create table if not exists public.stores (
  id bigserial primary key,
  store_name text not null,
  category text not null,                 -- 例如：餐飲美食 / 醫療健康 / 停車場 / 購物 / 美容美髮 / 教育培訓 / 景點觀光
  address text,
  approval text default 'pending',        -- 'approved' 會被查詢條件使用
  is_partner_store boolean default false,
  sponsorship_tier int default 0,
  rating numeric(3,2),
  store_code text,                        -- 'kentucky' 等
  features jsonb,                         -- { "tags":[], "secondary_category": "", "description":"" }
  has_member_discount boolean default false, -- 統計用
  is_safe_store boolean default false,       -- 統計用
  business_hours text,
  created_at timestamptz default now()
);

-- 建立基本索引
create index if not exists idx_stores_approval on public.stores(approval);
create index if not exists idx_stores_category on public.stores(category);
create index if not exists idx_stores_partner on public.stores(is_partner_store desc, sponsorship_tier desc, rating desc);

-- faqs
create table if not exists public.faqs (
  id bigserial primary key,
  question text not null,
  answer text not null,
  category text,
  is_active boolean default true,
  created_at timestamptz default now()
);
create index if not exists idx_faqs_active on public.faqs(is_active);

-- chat_sessions (確保 session_id 唯一)
create table if not exists public.chat_sessions (
  id bigserial primary key,
  session_id text not null unique,
  started_at timestamptz,
  last_activity timestamptz,
  message_count int default 0,
  user_id text,
  user_ip text,
  user_agent text,
  user_meta jsonb,
  created_at timestamptz default now()
);

-- chat_messages
create table if not exists public.chat_messages (
  id bigserial primary key,
  session_id text not null,
  message_type text check (message_type in ('user','bot')),
  content text not null,
  created_at timestamptz default now()
);
create index if not exists idx_chat_messages_session_created on public.chat_messages(session_id, created_at desc);

-- recommendation_logs（你的 DataLayer.logRecommendation 會用到）
create table if not exists public.recommendation_logs (
  id bigserial primary key,
  session_id text,
  intent text,
  recommended_stores jsonb,     -- 存放推薦清單（陣列）
  recommendation_logic jsonb,   -- 存放排序、驗證、處理時間等
  created_at timestamptz default now()
);
create index if not exists idx_reco_logs_session on public.recommendation_logs(session_id);

-- 如果 stores 表已存在但缺少欄位，添加缺失欄位
do $$
begin
  -- 檢查並添加 has_member_discount 欄位
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='has_member_discount') then
    alter table public.stores add column has_member_discount boolean default false;
  end if;
  
  -- 檢查並添加 is_safe_store 欄位
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='is_safe_store') then
    alter table public.stores add column is_safe_store boolean default false;
  end if;
  
  -- 檢查並添加 business_hours 欄位
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='business_hours') then
    alter table public.stores add column business_hours text;
  end if;
  
  -- 檢查並添加 store_code 欄位
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='store_code') then
    alter table public.stores add column store_code text;
  end if;
  
  -- 檢查並添加 rating 欄位
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='rating') then
    alter table public.stores add column rating numeric(3,2);
  end if;
  
  -- 檢查並添加 sponsorship_tier 欄位
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='sponsorship_tier') then
    alter table public.stores add column sponsorship_tier int default 0;
  end if;
  
  -- 檢查並添加 is_partner_store 欄位
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='is_partner_store') then
    alter table public.stores add column is_partner_store boolean default false;
  end if;
  
  -- 檢查並添加 approval 欄位
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='approval') then
    alter table public.stores add column approval text default 'pending';
  end if;
  
  -- 檢查並添加 features 欄位
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='features') then
    alter table public.stores add column features jsonb;
  end if;
end
$$;

-- 安全地處理 features 欄位類型轉換（先處理視圖依賴）
do $$
begin
  -- 先刪除可能依賴 features 欄位的視圖
  drop view if exists public.eligible_stores;
  
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
  
  -- 確保 GIN 索引存在
  if not exists (
    select 1 from pg_indexes 
    where tablename='stores' and indexname='idx_stores_features_gin'
  ) then
    create index idx_stores_features_gin on public.stores using gin (features);
    raise notice 'Created GIN index for features column';
  else
    raise notice 'GIN index for features already exists';
  end if;
  
  -- 重建 eligible_stores 視圖
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
  
  raise notice 'Recreated eligible_stores view';
end
$$;

-- 更新現有資料的 features 欄位格式
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

-- 為空 features 設置預設值
update public.stores 
set features = '{"tags": [], "secondary_category": "", "description": ""}'::jsonb
where features is null;

-- 建立必要的統計視圖
create or replace view public.store_stats as
select 
  count(*) as total_stores,
  count(*) filter (where approval = 'approved') as approved_stores,
  count(*) filter (where is_safe_store = true) as safe_stores,
  count(*) filter (where has_member_discount = true) as discount_stores,
  count(*) filter (where is_partner_store = true) as partner_stores,
  count(distinct category) as category_count
from public.stores;

-- 測試查詢
select 
  'Migration completed successfully' as status,
  count(*) as total_stores,
  count(*) filter (where has_member_discount = true) as discount_stores,
  count(*) filter (where is_partner_store = true) as partner_stores,
  count(distinct category) as category_count
from public.stores;
