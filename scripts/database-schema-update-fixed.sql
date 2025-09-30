-- 使用者基本資料（用 external_id 連 LINE 或你的前端）
create table if not exists user_profiles (
  id bigint generated always as identity primary key,
  external_id text unique not null,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 會話表更新
alter table chat_sessions
  add column if not exists user_id bigint references user_profiles(id),
  add column if not exists user_meta jsonb;

-- 商家表更新
alter table stores
  add column if not exists is_partner_store boolean not null default false;

-- 建索引（提高名稱查詢與排序效率）
create index if not exists idx_stores_name on stores (store_name);
create index if not exists idx_stores_partner on stores (is_partner_store);

-- 修復：先檢查 features 欄位類型，再建立評分索引
-- 如果 features 是 JSONB 類型，使用以下語法：
create index if not exists idx_stores_rating on stores ((features->>'rating'));

-- 如果 features 是 TEXT 類型，使用以下語法：
-- create index if not exists idx_stores_rating on stores ((features::jsonb->>'rating'));

-- 如果 features 欄位不存在或為空，先跳過評分索引
-- create index if not exists idx_stores_rating on stores ((features->>'rating')) where features is not null;
