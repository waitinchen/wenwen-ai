# 🚨 完整修復檢查清單

## 📋 緊急修復步驟

### 🔧 步驟 1: 修復資料庫結構

#### 執行位置: Supabase Dashboard > SQL Editor

```sql
-- 1. 添加 is_partner_store 欄位
ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_partner_store BOOLEAN DEFAULT false;

-- 2. 將肯塔基美語設為特約商家
UPDATE stores SET is_partner_store = true WHERE store_name ILIKE '%肯塔基%';

-- 3. 驗證更新結果
SELECT 
    id, 
    store_name, 
    is_partner_store,
    is_safe_store,
    has_member_discount
FROM stores 
WHERE store_name ILIKE '%肯塔基%';

-- 4. 檢查所有特約商家
SELECT 
    COUNT(*) as total_stores,
    SUM(CASE WHEN is_partner_store = true THEN 1 ELSE 0 END) as partner_stores,
    SUM(CASE WHEN is_safe_store = true THEN 1 ELSE 0 END) as safe_stores,
    SUM(CASE WHEN has_member_discount = true THEN 1 ELSE 0 END) as discount_stores
FROM stores;
```

#### 預期結果:
- ✅ `is_partner_store` 欄位已添加
- ✅ 肯塔基美語設為特約商家
- ✅ 查詢結果顯示 `is_partner_store = true`

### 🚀 步驟 2: 重新部署 Edge Function

#### 方法 1: 使用 Supabase Dashboard (推薦)
1. 前往: https://supabase.com/dashboard/project/vqcuwjfxoxjgsrueqodj/functions
2. 找到 `claude-chat` 函數
3. 點擊 "Deploy" 按鈕
4. 確認部署成功

#### 方法 2: 使用 Supabase CLI
```bash
npm install -g supabase
supabase login
supabase functions deploy claude-chat
```

### ✅ 步驟 3: 驗證修復結果

#### 3.1 驗證資料庫修復
```bash
node scripts/emergency-fix-all-issues.js
```

#### 3.2 驗證 Edge Function 部署
```bash
node scripts/verify-deployment.js
```

#### 3.3 驗證前台功能
1. 訪問管理後台: http://localhost:3000/admin/stores
2. 檢查 "特約商家" 數量是否顯示為 1
3. 訪問前台: http://localhost:3000
4. 測試查詢 "我想學美語"
5. 確認優先推薦肯塔基美語

## 🎯 預期修復結果

### ✅ 資料庫修復成功指標
- [ ] `is_partner_store` 欄位存在
- [ ] 肯塔基美語設為特約商家
- [ ] 管理後台顯示 "特約商家: 1"

### ✅ Edge Function 修復成功指標
- [ ] 查詢 "我想學美語" 優先推薦肯塔基美語
- [ ] 查詢 "推薦美語補習班" 優先推薦肯塔基美語
- [ ] 查詢 "英文學習" 優先推薦肯塔基美語
- [ ] 查詢 "補習班推薦" 優先推薦肯塔基美語

### ✅ 前台功能修復成功指標
- [ ] 管理後台特約商家狀態可以正常更新
- [ ] 前台查詢英語相關問題優先推薦肯塔基美語
- [ ] 不再推薦其他補習班

## 🚨 緊急修復優先級

### 🔴 最高優先級 (立即執行)
1. **資料庫 SQL 修復** - 添加 `is_partner_store` 欄位
2. **Edge Function 重新部署** - 確保肯塔基美語優先推薦邏輯生效

### 🟡 高優先級 (修復後驗證)
1. **驗證資料庫修復結果**
2. **驗證 Edge Function 部署結果**
3. **測試前台功能**

### 🟢 中優先級 (功能驗證)
1. **完整功能測試**
2. **用戶體驗驗證**
3. **性能檢查**

## 📞 支援資訊

### 修復失敗時的備用方案
1. 檢查 Supabase Dashboard 狀態
2. 確認 API 金鑰是否正確
3. 檢查網路連接
4. 重新執行修復步驟

### 聯絡資訊
- 專案: wenwen-ai
- 資料庫: vqcuwjfxoxjgsrueqodj.supabase.co
- 版本: WEN 1.0.6

---

## ⚡ 立即行動

**現在立即執行步驟 1 和步驟 2！**

1. 複製 SQL 程式碼到 Supabase Dashboard 執行
2. 重新部署 Edge Function
3. 執行驗證腳本

**修復完成後，兩個關鍵問題都將解決！** 🎉
