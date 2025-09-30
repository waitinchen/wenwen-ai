# 🚨 修復資料庫表結構

## 問題發現
`chat_sessions` 表缺少必要的欄位：
- `user_id` (用於關聯 user_profiles)
- `last_message_preview` (用於顯示最後訊息預覽)

## 修復步驟

### 1. 執行 SQL 修復
前往 Supabase Dashboard > SQL Editor，執行以下 SQL：

```sql
-- 添加缺少的欄位
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS last_message_preview TEXT;

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions (session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_activity ON chat_sessions (last_activity);
```

### 2. 驗證修復
執行以下查詢確認欄位已添加：
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chat_sessions' 
ORDER BY ordinal_position;
```

### 3. 設定 Edge Function 環境變數
在 Edge Function 環境變數中添加：
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE
```

### 4. 測試修復
執行測試腳本確認修復成功：
```bash
node scripts/test-service-role-key.js
```

## 預期結果
修復完成後，Edge Function 應該能正常寫入資料庫，對話記錄管理頁面也會顯示新的資料。
