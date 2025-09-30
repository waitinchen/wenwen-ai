# 🚨 環境變數檢查指南

## 問題診斷
Edge Function 運行正常但無法寫入資料庫，很可能是環境變數沒有正確設定。

## 檢查步驟

### 1. 檢查 Edge Function 環境變數
1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇你的專案
3. 前往 **Edge Functions** > **claude-chat**
4. 點擊 **Settings** 標籤
5. 檢查 **Environment Variables** 是否包含：

```
CLAUDE_API_KEY=your_claude_api_key
SUPABASE_URL=https://vqcuwjfxoxjgsrueqodj.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. 獲取 Service Role Key
1. 前往 **Settings** > **API**
2. 複製 **service_role** 密鑰
3. 貼上到 Edge Function 的環境變數中

### 3. 測試環境變數
如果環境變數設定正確，可以：
1. 複製 `scripts/test-env-edge-function.ts` 的內容
2. 暫時替換 claude-chat Edge Function 的代碼
3. 部署並測試
4. 檢查日誌中的環境變數狀態

### 4. 常見問題
- **環境變數名稱錯誤**：確保名稱完全正確（大小寫敏感）
- **Service Role Key 錯誤**：使用 service_role 而不是 anon key
- **環境變數沒有保存**：確保點擊 Save 按鈕

## 預期結果
環境變數設定正確後，資料庫寫入應該能正常工作。
