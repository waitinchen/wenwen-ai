-- 創建 user_profiles 表
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_external_id ON user_profiles (external_id);

-- 檢查表是否創建成功
SELECT 'user_profiles table created successfully' as status;
