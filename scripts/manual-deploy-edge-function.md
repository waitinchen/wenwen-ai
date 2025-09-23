# 🔧 手動部署 Edge Function 指南

## 🚨 緊急修復：Edge Function 沒有正確部署

### 📋 問題診斷
- ✅ Edge Function 程式碼正確
- ❌ 部署的版本沒有包含肯塔基美語優先推薦邏輯
- ❌ 所有英語相關查詢都沒有推薦肯塔基美語

### 🔧 手動部署步驟

#### 方法 1: 使用 Supabase Dashboard

1. **前往 Supabase Dashboard**
   - 網址: https://supabase.com/dashboard
   - 選擇專案: vqcuwjfxoxjgsrueqodj

2. **進入 Edge Functions**
   - 左側選單 → Edge Functions
   - 找到 `claude-chat` 函數

3. **重新部署**
   - 點擊 `claude-chat` 函數
   - 點擊 "Deploy" 按鈕
   - 確認部署成功

#### 方法 2: 使用 Supabase CLI

```bash
# 安裝 Supabase CLI
npm install -g supabase

# 登入 Supabase
supabase login

# 部署 Edge Function
supabase functions deploy claude-chat
```

#### 方法 3: 直接編輯 Edge Function

1. **前往 Supabase Dashboard**
   - Edge Functions → claude-chat

2. **編輯程式碼**
   - 複製 `supabase/functions/claude-chat/index.ts` 的內容
   - 貼到 Dashboard 的編輯器中

3. **部署**
   - 點擊 "Deploy" 按鈕

### 🎯 驗證部署結果

部署完成後，執行以下測試：

```bash
node scripts/test-edge-function-deployment.js
```

### 📝 預期結果

所有英語相關查詢都應該：
1. ✅ 優先推薦肯塔基美語
2. ✅ 詳細介紹肯塔基美語優勢
3. ❌ 不推薦其他補習班

### 🚨 緊急修復優先級

**最高優先級**: 立即部署 Edge Function，確保肯塔基美語優先推薦邏輯生效！

---

## 📋 同時修復資料庫問題

### 🔧 修復 `is_partner_store` 欄位

在 Supabase Dashboard 中執行以下 SQL：

```sql
-- 添加 is_partner_store 欄位
ALTER TABLE stores ADD COLUMN is_partner_store BOOLEAN DEFAULT false;

-- 將肯塔基美語設為特約商家
UPDATE stores SET is_partner_store = true WHERE store_name ILIKE '%肯塔基%';

-- 驗證更新結果
SELECT id, store_name, is_partner_store FROM stores WHERE store_name ILIKE '%肯塔基%';
```

### 📊 預期結果

- ✅ `is_partner_store` 欄位存在
- ✅ 肯塔基美語設為特約商家
- ✅ 管理後台顯示 "特約商家: 1"
