# 📋 逐步執行指南

## 步驟 1: 修復資料庫表結構

### 1.1 前往 Supabase Dashboard
1. 打開瀏覽器，前往：https://supabase.com/dashboard
2. 登入你的帳號
3. 選擇你的專案（wenwen-ai）

### 1.2 執行 SQL 修復
1. 在左側選單中點擊 **SQL Editor**
2. 點擊 **New Query**
3. 複製並貼上以下 SQL：

```sql
-- 添加缺少的欄位
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS last_message_preview TEXT;

-- 創建索引提高效能
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions (session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_activity ON chat_sessions (last_activity);
```

4. 點擊 **Run** 按鈕執行
5. 確認沒有錯誤訊息

### 1.3 驗證修復
執行以下查詢確認欄位已添加：
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chat_sessions' 
ORDER BY ordinal_position;
```

## 步驟 2: 設定環境變數

### 2.1 前往 Edge Functions
1. 在左側選單中點擊 **Edge Functions**
2. 找到 **claude-chat** 函數
3. 點擊進入

### 2.2 設定環境變數
1. 點擊 **Settings** 標籤
2. 在 **Environment Variables** 區域
3. 添加新的環境變數：

**Name:** `SUPABASE_SERVICE_ROLE_KEY`
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE`

4. 點擊 **Save** 按鈕保存

## 步驟 3: 驗證修復

### 3.1 執行測試腳本
回到終端，執行：
```bash
node scripts/test-database-write.js
```

### 3.2 檢查結果
如果看到以下訊息表示成功：
```
✅ 用戶資料寫入成功
✅ 會話資料寫入成功
✅ 消息資料寫入成功
```

### 3.3 檢查管理後台
前往你的管理後台，檢查對話記錄管理頁面是否顯示新的對話記錄。

## ⏱️ 預估執行時間
- 步驟 1: 約 2-3 分鐘
- 步驟 2: 約 1-2 分鐘
- 步驟 3: 約 1 分鐘
- **總計：約 5 分鐘**

## 🆘 如果遇到問題
1. 截圖錯誤訊息
2. 告訴我具體在哪個步驟遇到問題
3. 我會提供針對性的解決方案
