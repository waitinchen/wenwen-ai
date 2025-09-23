# ⚡ 快速修復指令

## 🚨 立即執行以下修復

### 🔧 修復 1: 資料庫結構 (最高優先級)

#### 執行位置: Supabase Dashboard > SQL Editor
#### 網址: https://supabase.com/dashboard/project/vqcuwjfxoxjgsrueqodj/sql

```sql
-- 複製以下 SQL 並執行
ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_partner_store BOOLEAN DEFAULT false;
UPDATE stores SET is_partner_store = true WHERE store_name ILIKE '%肯塔基%';
```

### 🚀 修復 2: Edge Function 部署 (最高優先級)

#### 執行位置: Supabase Dashboard > Edge Functions
#### 網址: https://supabase.com/dashboard/project/vqcuwjfxoxjgsrueqodj/functions

1. 找到 `claude-chat` 函數
2. 點擊 "Deploy" 按鈕
3. 確認部署成功

### ✅ 修復 3: 驗證結果

#### 執行指令:
```bash
node scripts/auto-fix-all-issues.js
```

#### 預期結果:
- ✅ 資料庫修復: 完成
- ✅ Edge Function 修復: 完成
- ✅ 所有問題已修復！

---

## 🎯 修復完成後測試

### 測試 1: 管理後台
- 訪問: http://localhost:3000/admin/stores
- 檢查: "特約商家: 1"

### 測試 2: 前台功能
- 訪問: http://localhost:3000
- 測試: "我想學美語"
- 預期: 優先推薦肯塔基美語

---

## ⚡ 一鍵執行所有修復

```bash
# 1. 檢查當前狀態
node scripts/auto-fix-all-issues.js

# 2. 修復後驗證
node scripts/verify-deployment.js

# 3. 完整功能測試
npm run test:partner-stores
```

**現在立即執行修復 1 和修復 2！** 🚀
