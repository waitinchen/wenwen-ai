# 資料庫結構修復指南

## 問題描述
執行 `database-schema-upgrade.sql` 時出現錯誤：
```
ERROR: 42804: foreign key constraint "store_approval_history_store_id_fkey" cannot be implemented
DETAIL: Key columns "store_id" and "id" are of incompatible types: uuid and integer.
```

## 問題原因
- `stores` 表的 `id` 欄位是 `SERIAL`（即 `INTEGER` 類型）
- 升級腳本中使用了 `UUID` 類型創建外鍵約束
- 類型不匹配導致外鍵約束無法創建

## 解決方案

### 步驟 1: 使用修復後的 SQL 腳本
使用 `scripts/fix-database-schema.sql` 替代原來的升級腳本。

### 步驟 2: 在 Supabase Dashboard 執行
1. 前往 Supabase Dashboard > SQL Editor
2. 複製 `scripts/fix-database-schema.sql` 的內容
3. 貼上到 SQL Editor
4. 點擊 "Run" 按鈕執行

### 步驟 3: 驗證修復結果
執行以下查詢驗證表是否創建成功：
```sql
-- 檢查新表是否創建
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('store_approval_history', 'evidence_verification');

-- 檢查 stores 表的新欄位
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'stores' 
AND column_name IN ('approval', 'sponsorship_tier', 'store_code', 'evidence_level');

-- 檢查視圖是否創建
SELECT viewname FROM pg_views 
WHERE viewname IN ('eligible_stores', 'store_management_view');
```

## 修復內容

### 1. 資料型別修復
- 所有 `UUID` 改為 `INTEGER` 或 `SERIAL`
- 外鍵約束使用正確的資料型別

### 2. 新增的資料表
- `store_approval_history` - 審核歷史記錄
- `evidence_verification` - 證據驗證記錄

### 3. 新增的欄位（stores 表）
- `approval` - 審核狀態
- `sponsorship_tier` - 贊助等級
- `store_code` - 店家代碼
- `evidence_level` - 證據等級
- `eligibility_rules` - 資格規則配置
- `audit_notes` - 審核備註
- `approved_at` - 審核時間
- `approved_by` - 審核人員

### 4. 新增的視圖
- `eligible_stores` - 合格商家查詢視圖
- `store_management_view` - 管理後台查詢視圖

### 5. 新增的索引
- `idx_stores_approval` - 審核狀態索引
- `idx_stores_tier` - 贊助等級索引
- `idx_stores_approval_tier` - 複合索引
- `idx_stores_store_code` - 店家代碼索引
- `idx_stores_evidence_level` - 證據等級索引

## 測試驗證

### 1. 基本功能測試
```sql
-- 測試查詢合格商家
SELECT * FROM eligible_stores LIMIT 5;

-- 測試管理後台視圖
SELECT * FROM store_management_view LIMIT 5;

-- 測試審核狀態更新
UPDATE stores SET approval = 'suspended' WHERE store_name LIKE '%測試%';
```

### 2. 外鍵約束測試
```sql
-- 測試插入審核歷史（應該成功）
INSERT INTO store_approval_history (
  store_id, previous_status, new_status, changed_by
) VALUES (
  1, 'approved', 'suspended', 'test_user'
);

-- 測試插入證據驗證（應該成功）
INSERT INTO evidence_verification (
  store_id, evidence_type, evidence_value, verification_status
) VALUES (
  1, 'address', '測試地址', 'verified'
);
```

## 後續步驟

### 1. Edge Function 部署
修復資料庫後，可以部署新的 Edge Functions：
- `allowlist-recommendation` - 允許清單推薦引擎
- `evidence-based-gatekeeper` - 證據優先把關系統

### 2. 前端更新
更新前端代碼以支援新的允許清單架構：
- 更新 API 調用
- 添加管理後台組件
- 更新商家管理界面

### 3. 系統測試
執行完整的系統測試：
- 推薦功能測試
- 審核流程測試
- 管理後台測試

## 注意事項

1. **備份資料**：執行前請確保資料庫已備份
2. **權限檢查**：確保有足夠的權限創建表和索引
3. **相容性**：修復後的結構與現有代碼相容
4. **測試環境**：建議先在測試環境驗證

## 問題排除

### 如果仍然出現錯誤：
1. 檢查 `stores` 表的 `id` 欄位類型
2. 確認沒有重複的表或欄位
3. 檢查權限設定
4. 查看完整的錯誤訊息

### 聯繫支援：
如果問題持續，請提供：
- 完整的錯誤訊息
- 資料庫結構資訊
- 執行步驟
