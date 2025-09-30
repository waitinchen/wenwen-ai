-- 修復 chat_sessions 表結構

-- 1. 添加缺少的欄位
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS last_message_preview TEXT;

-- 2. 創建索引以提高查詢效能
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions (session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_activity ON chat_sessions (last_activity);

-- 3. 檢查表結構
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chat_sessions' 
ORDER BY ordinal_position;
