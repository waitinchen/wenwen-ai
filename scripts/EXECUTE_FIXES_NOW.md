# 🚀 立即執行修復指令

## ✅ 修復準備完成！

### 🔧 修復 1: 資料庫結構 (已完成準備)

#### 執行位置: Supabase Dashboard > SQL Editor
#### 網址: https://supabase.com/dashboard/project/vqcuwjfxoxjgsrueqodj/sql

```sql
-- 複製以下 SQL 並執行
ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_partner_store BOOLEAN DEFAULT false;
UPDATE stores SET is_partner_store = true WHERE store_name ILIKE '%肯塔基%';
```

### 🚀 修復 2: Edge Function 部署 (已完成準備)

#### 執行位置: Supabase Dashboard > Edge Functions
#### 網址: https://supabase.com/dashboard/project/vqcuwjfxoxjgsrueqodj/functions

1. 找到 `claude-chat` 函數
2. 點擊 "Deploy" 按鈕
3. 確認部署成功

---

## 🎯 執行順序

### 步驟 1: 修復資料庫 (優先級: 最高)
1. 前往: https://supabase.com/dashboard/project/vqcuwjfxoxjgsrueqodj/sql
2. 複製並執行 SQL 指令
3. 確認執行成功

### 步驟 2: 部署 Edge Function (優先級: 最高)
1. 前往: https://supabase.com/dashboard/project/vqcuwjfxoxjgsrueqodj/functions
2. 找到 `claude-chat` 函數
3. 點擊 "Deploy" 按鈕
4. 確認部署成功

### 步驟 3: 驗證修復結果
```bash
node scripts/verify-edge-function-deployment.js
```

---

## 📊 預期結果

### 修復 1 成功指標:
- ✅ `is_partner_store` 欄位已添加
- ✅ 肯塔基美語設為特約商家
- ✅ 管理後台顯示 "特約商家: 1"

### 修復 2 成功指標:
- ✅ 查詢 "我想學美語" 優先推薦肯塔基美語
- ✅ 查詢 "推薦美語補習班" 優先推薦肯塔基美語
- ✅ 查詢 "英文學習" 優先推薦肯塔基美語
- ✅ 查詢 "補習班推薦" 優先推薦肯塔基美語

---

## 🚨 立即行動

**現在立即執行步驟 1 和步驟 2！**

1. **複製 SQL 到 Supabase Dashboard 執行**
2. **重新部署 Edge Function**
3. **執行驗證腳本**

**修復完成後，兩個關鍵問題都將解決！** 🎉

---

## 📞 支援資訊

### 如果修復失敗:
1. 檢查 Supabase Dashboard 狀態
2. 確認網路連接
3. 重新執行修復步驟

### 驗證工具:
- `scripts/verify-edge-function-deployment.js` - Edge Function 驗證
- `scripts/auto-fix-all-issues.js` - 完整狀態檢查

**C 謀持續工作模式已啟動！立即執行修復！** 🚀
