# 🏪 允許清單架構部署指南

## 📋 系統概述

允許清單架構是一個健康、可治理、可審核的推薦系統，取代傳統的黑名單架構，實現：
- **允許清單（Allowlist）**：只推薦通過審核的商家
- **資格規則（Eligibility）**：確保符合授權和合規要求
- **贊助等級（Sponsorship Tier）**：支持商業策略和優先級管理
- **證據優先（Evidence-required）**：確保推薦基於真實證據

## 🎯 架構優勢

### 為什麼這樣更好？
- ✅ **正向治理**：不是封殺名單，而是只展示**通過審核**的實體
- ✅ **法務友善**：避免「黑名單」敏感詞與誤傷風險
- ✅ **可擴充**：贊助等級與審核流程天然支援商業策略
- ✅ **一致邏輯**：配合「資料優先 × 語氣誠實 × 靈格有溫度」的核心哲學

## 🚀 部署步驟

### 步驟 1: 資料庫結構升級

#### 1.1 執行資料庫升級腳本
```sql
-- 執行完整的資料庫結構升級
-- 檔案: scripts/database-schema-upgrade.sql

-- 主要變更：
-- 1. 添加審核狀態枚舉 (approval_status)
-- 2. 升級 stores 表結構
-- 3. 創建審核歷史表
-- 4. 創建資格規則配置表
-- 5. 創建證據驗證表
-- 6. 創建推薦日誌表
-- 7. 創建管理視圖和函數
```

#### 1.2 驗證資料庫升級
```sql
-- 檢查新欄位
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'stores' 
AND column_name IN ('approval', 'sponsorship_tier', 'store_code', 'evidence_level');

-- 檢查新表
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('store_approval_history', 'eligibility_rules', 'evidence_verification');

-- 檢查視圖
SELECT viewname 
FROM pg_views 
WHERE viewname IN ('eligible_stores', 'store_management_view');
```

### 步驟 2: Edge Function 部署

#### 2.1 部署允許清單推薦引擎
1. 前往 Supabase Dashboard > Edge Functions
2. 創建新函數: `allowlist-recommendation`
3. 將 `scripts/allowlist-recommendation-engine.ts` 的內容複製到函數中
4. 點擊 "Deploy" 按鈕

#### 2.2 部署證據優先把關系統
1. 創建新函數: `evidence-based-gatekeeper`
2. 將 `scripts/evidence-based-gatekeeper.ts` 的內容複製到函數中
3. 點擊 "Deploy" 按鈕

### 步驟 3: 前端整合

#### 3.1 更新 API 調用
```typescript
// 在 src/lib/api.ts 中更新
const response = await supabase.functions.invoke('allowlist-recommendation', {
  body: {
    session_id: sessionId,
    message: { content: message },
    user_meta: userMeta
  }
});
```

#### 3.2 添加審核管理後台
```typescript
// 在 src/components/admin/ 中添加
import StoreApprovalAdminDashboard from './StoreApprovalAdminDashboard';

// 在 AdminLayout.tsx 中添加路由
<Route path="/admin/store-approval" element={<StoreApprovalAdminDashboard />} />
```

### 步驟 4: 環境變數配置

確保以下環境變數已設定：
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SERVICE_ROLE_KEY=your-service-role-key
CLAUDE_API_KEY=your-claude-api-key
CLAUDE_MODEL=claude-3-haiku-20240307
```

## 🧪 測試驗證

### 4.1 執行允許清單架構測試
```bash
node scripts/test-allowlist-architecture.js
```

### 4.2 手動測試案例
```bash
# 測試正常推薦
curl -X POST https://your-project.supabase.co/functions/v1/allowlist-recommendation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"session_id":"test","message":{"content":"有什麼美食推薦？"},"user_meta":{}}'

# 測試英語學習推薦
curl -X POST https://your-project.supabase.co/functions/v1/allowlist-recommendation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"session_id":"test","message":{"content":"我想學英語"},"user_meta":{}}'
```

## 📊 監控和管理

### 5.1 訪問管理後台
1. 登入管理後台
2. 導航到 "店家審核管理"
3. 查看實時監控數據

### 5.2 審核狀態管理
```sql
-- 查看審核狀態分佈
SELECT approval, COUNT(*) as count 
FROM stores 
GROUP BY approval 
ORDER BY count DESC;

-- 查看贊助等級分佈
SELECT sponsorship_tier, COUNT(*) as count 
FROM stores 
WHERE approval = 'approved'
GROUP BY sponsorship_tier 
ORDER BY sponsorship_tier DESC;

-- 查看證據等級分佈
SELECT evidence_level, COUNT(*) as count 
FROM stores 
WHERE approval = 'approved'
GROUP BY evidence_level 
ORDER BY count DESC;
```

### 5.3 推薦日誌分析
```sql
-- 查看推薦統計
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as total_recommendations,
  AVG(jsonb_array_length(recommended_stores)) as avg_stores_per_recommendation
FROM recommendation_logs 
GROUP BY DATE(timestamp) 
ORDER BY date DESC;

-- 查看最常推薦的商家
SELECT 
  store->>'name' as store_name,
  COUNT(*) as recommendation_count
FROM recommendation_logs,
LATERAL jsonb_array_elements(recommended_stores) as store
GROUP BY store->>'name'
ORDER BY recommendation_count DESC
LIMIT 10;
```

## 🔧 故障排除

### 常見問題

#### 問題 1: 推薦結果為空
**症狀**: 所有推薦查詢都返回空結果
**解決**: 檢查是否有 `approval='approved'` 的商家

```sql
-- 檢查合格商家數量
SELECT COUNT(*) FROM stores WHERE approval = 'approved';
```

#### 問題 2: 肯塔基美語未出現
**症狀**: 英語學習推薦中沒有肯塔基美語
**解決**: 檢查肯塔基美語的配置

```sql
-- 檢查肯塔基美語配置
SELECT * FROM stores WHERE store_name LIKE '%肯塔基美語%';
UPDATE stores SET store_code = 'kentucky', sponsorship_tier = 2 WHERE store_name LIKE '%肯塔基美語%';
```

#### 問題 3: 贊助等級排序錯誤
**症狀**: 主推商家沒有優先顯示
**解決**: 檢查贊助等級設定和排序邏輯

```sql
-- 檢查贊助等級設定
SELECT store_name, sponsorship_tier, approval 
FROM stores 
WHERE approval = 'approved'
ORDER BY sponsorship_tier DESC;
```

#### 問題 4: 證據驗證失敗
**症狀**: 已驗證的商家被過濾掉
**解決**: 檢查證據等級設定

```sql
-- 檢查證據等級
SELECT store_name, evidence_level, approval 
FROM stores 
WHERE approval = 'approved'
ORDER BY evidence_level;
```

### 日誌檢查
```sql
-- 查看最近的推薦日誌
SELECT * FROM recommendation_logs 
ORDER BY timestamp DESC 
LIMIT 10;

-- 查看審核歷史
SELECT * FROM store_approval_history 
ORDER BY changed_at DESC 
LIMIT 10;
```

## 📈 效能優化

### 6.1 資料庫優化
- 確保所有索引都已建立
- 定期分析查詢效能
- 考慮分區大表

### 6.2 查詢優化
- 使用預建視圖 `eligible_stores`
- 利用複合索引 `idx_stores_approval_tier`
- 快取常見查詢結果

### 6.3 監控指標
- 推薦回應時間
- 審核通過率
- 證據驗證率
- 贊助等級分佈

## 🚨 緊急處理

### 緊急停用特定商家
```sql
-- 暫停特定商家曝光
UPDATE stores 
SET approval = 'suspended', audit_notes = '緊急暫停' 
WHERE store_name = '問題商家名稱';
```

### 緊急回滾
1. 停用 `allowlist-recommendation` 函數
2. 恢復原有的 API 調用
3. 檢查系統穩定性

## 📚 維護指南

### 日常維護
- 每日檢查審核狀態
- 每週分析推薦統計
- 每月更新贊助等級

### 定期更新
- 更新資格規則
- 優化證據驗證流程
- 調整贊助等級策略

### 備份策略
- 定期備份審核歷史
- 備份推薦日誌
- 測試恢復流程

## 🔮 未來擴展

### 短期擴展（1個月內）
- 完善證據驗證機制
- 增加自動審核流程
- 優化推薦演算法

### 中期擴展（3個月內）
- 多語言支援
- 智能推薦學習
- 預測性審核

### 長期擴展（6個月內）
- 完整的信任管理平台
- 跨平台審核服務
- 企業級合規管理

---

**記住**: 允許清單架構是健康、可治理的推薦系統基礎，需要持續監控和優化。通過建立完善的審核和管理機制，可以確保系統的長期穩定運行，實現正向治理的目標。
