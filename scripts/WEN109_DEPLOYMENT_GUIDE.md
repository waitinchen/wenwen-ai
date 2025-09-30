# WEN 1.0.9 部署指南

## 🎯 版本重點

**WEN 1.0.9 - 補強版本：保障推薦清單永不為空 + Service Role Key**

### ✅ 已實施的關鍵補強：

1. **保障「推薦清單永不為空」的 fallback**
   - 當主查詢失敗或結果為空時，自動補上肯塔基美語
   - 支援固定 ID 和名稱兩種查詢方式
   - 確保前端永遠不會收到空陣列

2. **改用 Service Role Key 進行資料庫寫入**
   - 避免 RLS（Row Level Security）限制
   - 確保對話記錄能正常寫入
   - 提高資料庫操作的穩定性

3. **增強錯誤處理和日誌**
   - 詳細的 fallback 觸發日誌
   - 資料庫寫入錯誤處理
   - 不阻擋 AI 回應的容錯機制

## 🔧 部署步驟

### 1. 環境變數配置

在 Supabase Dashboard > Settings > Edge Functions 中確保以下環境變數：

```bash
# 基本配置
SUPABASE_URL=https://vqcuwjfxoxjgsrueqodj.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo

# 新增：Service Role Key（重要！）
SUPABASE_SERVICE_ROLE_KEY=[在 Supabase Dashboard > Settings > API 中找到]

# Claude API
CLAUDE_API_KEY=[您的 Claude API Key]

# 可選：肯塔基美語固定 ID
KENTUCKY_STORE_ID=[可選] 肯塔基美語的固定 ID
```

### 2. 部署 Edge Function

1. 前往 Supabase Dashboard
2. 進入 Functions > claude-chat
3. 複製 `scripts/complete-edge-function-code-wen109.ts` 的內容
4. 貼上到編輯器中
5. 點擊 **Deploy** 按鈕

### 3. 驗證部署

執行測試腳本：

```bash
# 測試基本功能
npm run test:kentucky

# 測試對話記錄寫入
node scripts/test-simple-conversation.js

# 測試推薦系統
npm run eval:partner
npm run eval:quick
npm run eval:parking
```

## 🧪 預期測試結果

### ✅ 成功指標：

1. **推薦清單永不為空**
   - 英語相關查詢：至少包含肯塔基美語
   - 一般查詢：提供 1-3 家相關商家
   - Fallback 機制正常運作

2. **對話記錄正常寫入**
   - `chat_sessions` 表有記錄
   - `chat_messages` 表有記錄
   - `user_profiles` 表有記錄
   - 管理後台顯示新對話

3. **Service Role Key 生效**
   - 資料庫寫入無權限錯誤
   - 日誌中無 RLS 相關錯誤

## 🔍 故障排除

### 如果推薦清單仍為空：

1. 檢查 `KENTUCKY_STORE_ID` 環境變數
2. 確認肯塔基美語在 `stores` 表中存在
3. 查看 Edge Function 日誌中的 fallback 觸發訊息

### 如果對話記錄仍無法寫入：

1. 確認 `SUPABASE_SERVICE_ROLE_KEY` 已設定
2. 檢查 `user_profiles` 表是否存在
3. 查看 Edge Function 日誌中的資料庫錯誤

### 如果 Service Role Key 錯誤：

1. 前往 Supabase Dashboard > Settings > API
2. 複製 `service_role` 密鑰
3. 在 Edge Function 環境變數中設定

## 📊 版本比較

| 功能 | WEN 1.0.8 | WEN 1.0.9 |
|------|-----------|-----------|
| 推薦清單 fallback | ✅ 基本 | ✅ 強化 |
| Service Role Key | ❌ | ✅ |
| 資料庫寫入穩定性 | ⚠️ 一般 | ✅ 高 |
| 錯誤處理 | ⚠️ 基本 | ✅ 完善 |
| 日誌追蹤 | ⚠️ 基本 | ✅ 詳細 |

## 🎉 部署完成檢查清單

- [ ] 環境變數已正確設定（包含 Service Role Key）
- [ ] Edge Function 已部署 WEN 1.0.9
- [ ] 測試腳本全部通過
- [ ] 管理後台顯示新對話記錄
- [ ] 推薦清單不再為空
- [ ] 前端版本顯示 WEN 1.0.9

---

**🚀 部署完成後，高文文將擁有更穩定的推薦系統和對話記錄功能！**
