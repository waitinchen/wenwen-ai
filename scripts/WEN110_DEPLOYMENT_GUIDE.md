# WEN 1.1.0 重大升級部署指南

## 🎯 版本重點

**WEN 1.1.0 - 重大升級版本：推薦系統完全穩定化 + Service Role Key + 智能 Fallback**

### ✅ 重大改進功能：

1. **推薦清單永不為空機制**
   - ✅ 英語查詢：自動補上肯塔基美語（特約商家）
   - ✅ 一般查詢：提供預設商家推薦
   - ✅ 主查詢失敗：智能 fallback 確保有推薦

2. **Service Role Key 全面採用**
   - ✅ 避免 RLS（Row Level Security）限制
   - ✅ 確保對話記錄能正常寫入
   - ✅ 提高資料庫操作穩定性

3. **智能 Fallback 系統**
   - ✅ 支援固定 ID 和名稱兩種查詢方式
   - ✅ 多層 fallback 機制
   - ✅ 詳細的日誌追蹤

4. **對話記錄系統優化**
   - ✅ 完整的用戶資料管理
   - ✅ 會話狀態追蹤
   - ✅ 訊息計數統計

## 🔧 部署步驟

### 1. 環境變數配置

在 Supabase Dashboard > Settings > Edge Functions 中確保以下環境變數：

```bash
# 基本配置
SUPABASE_URL=https://vqcuwjfxoxjgsrueqodj.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo

# 關鍵：Service Role Key（必須設定！）
SUPABASE_SERVICE_ROLE_KEY=[從 Supabase Dashboard > Settings > API 複製 service_role 密鑰]

# Claude API
CLAUDE_API_KEY=[您的 Claude API Key]

# 可選：肯塔基美語固定 ID
KENTUCKY_STORE_ID=[可選] 肯塔基美語的固定 ID
```

### 2. 部署 Edge Function

1. 前往 Supabase Dashboard
2. 進入 Functions > claude-chat
3. 複製 `scripts/index.ts` 的內容
4. 貼上到編輯器中
5. 點擊 **Deploy** 按鈕

### 3. 驗證部署

執行測試腳本：

```bash
# 快速功能測試
node scripts/quick-test.js

# 完整部署測試
npm run test:wen109

# 肯塔基整合測試
npm run test:kentucky
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

| 功能 | WEN 1.0.x | WEN 1.1.0 |
|------|-----------|-----------|
| 推薦清單穩定性 | ⚠️ 不穩定 | ✅ 完全穩定 |
| Fallback 機制 | ❌ 基本 | ✅ 智能多層 |
| Service Role Key | ❌ 未使用 | ✅ 全面採用 |
| 對話記錄 | ⚠️ 時常失敗 | ✅ 完全正常 |
| 錯誤處理 | ⚠️ 基本 | ✅ 完善 |
| 日誌追蹤 | ⚠️ 基本 | ✅ 詳細 |

## 🎉 部署完成檢查清單

- [ ] 環境變數已正確設定（包含 Service Role Key）
- [ ] Edge Function 已部署 WEN 1.1.0
- [ ] 快速測試通過（`node scripts/quick-test.js`）
- [ ] 完整測試通過（`npm run test:wen109`）
- [ ] 管理後台顯示新對話記錄
- [ ] 推薦清單永不為空
- [ ] 前端版本顯示 WEN 1.1.0

## 🚀 重大升級亮點

1. **推薦系統完全穩定化**
   - 從不穩定的推薦系統升級為永不為空的智能推薦
   - 支援英語查詢和一般查詢的差異化處理

2. **資料庫操作全面優化**
   - 採用 Service Role Key 避免權限問題
   - 對話記錄系統完全正常化

3. **錯誤處理和容錯機制**
   - 多層 fallback 機制
   - 詳細的日誌追蹤
   - 不阻擋 AI 回應的容錯設計

---

**🚀 部署完成後，高文文將擁有業界領先的穩定推薦系統和完整的對話記錄功能！**
