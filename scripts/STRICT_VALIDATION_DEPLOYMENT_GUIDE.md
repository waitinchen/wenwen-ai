# 🔒 嚴格驗收標準部署指南 - 語氣靈檢察官

## 📋 系統概述

語氣靈檢察官是一個嚴格的驗收標準系統，確保 AI 回應達到以下標準：
- **0 幻覺**：提到的資料必須存在於 DB 或 FAQ
- **0 禁詞**：未授權補習班絕對不出現
- **100% 語氣合格**：輸出保留高文文的人格

## 🎯 驗收標準詳解

### 標準 1: 0 幻覺檢查
- **目標**：確保所有提到的實體都真實存在
- **檢查項目**：
  - 商家名稱存在於資料庫
  - 地址格式正確且真實
  - 電話號碼格式正確
  - 營業時間格式正確
  - 不包含已知的幻覺模式

### 標準 2: 0 禁詞檢查
- **目標**：確保不推薦未授權的補習班
- **檢查項目**：
  - 不包含未授權補習班名稱
  - 英語學習只推薦肯塔基美語
  - 不包含違規內容
  - 符合授權要求

### 標準 3: 100% 語氣合格檢查
- **目標**：確保回應符合高文文的人格特徵
- **檢查項目**：
  - 包含正面人格特徵
  - 避免負面人格特徵
  - 不使用禁止的語氣模式
  - 回應長度適中
  - 語氣自然親切

## 🚀 部署步驟

### 步驟 1: 資料庫準備

#### 1.1 創建檢察官日誌表
```sql
-- 創建檢察官日誌表
CREATE TABLE IF NOT EXISTS prosecutor_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  original_response TEXT NOT NULL,
  final_response TEXT NOT NULL,
  corrections JSONB DEFAULT '[]',
  validation_results JSONB DEFAULT '[]',
  strict_standards JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_prosecutor_logs_session_id ON prosecutor_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_prosecutor_logs_timestamp ON prosecutor_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_prosecutor_logs_standards ON prosecutor_logs USING GIN(strict_standards);
```

#### 1.2 創建自動調用日誌表
```sql
-- 創建自動調用日誌表
CREATE TABLE IF NOT EXISTS auto_invoke_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  original_response TEXT NOT NULL,
  final_response TEXT NOT NULL,
  prosecutor_result JSONB DEFAULT '{}',
  invoke_details JSONB DEFAULT '{}',
  success BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_auto_invoke_logs_session_id ON auto_invoke_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_auto_invoke_logs_timestamp ON auto_invoke_logs(timestamp);
```

#### 1.3 創建信任層日誌表
```sql
-- 創建信任層日誌表
CREATE TABLE IF NOT EXISTS trust_layer_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  original_response TEXT NOT NULL,
  final_response TEXT NOT NULL,
  trust_score INTEGER NOT NULL,
  trust_components JSONB DEFAULT '[]',
  evaluation_details JSONB DEFAULT '{}',
  passed BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_trust_layer_logs_session_id ON trust_layer_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_trust_layer_logs_trust_score ON trust_layer_logs(trust_score);
CREATE INDEX IF NOT EXISTS idx_trust_layer_logs_timestamp ON trust_layer_logs(timestamp);
```

### 步驟 2: Edge Function 部署

#### 2.1 部署語氣靈檢察官
1. 前往 Supabase Dashboard > Edge Functions
2. 創建新函數: `tone-spirit-prosecutor`
3. 將 `scripts/strict-validation-system.ts` 的內容複製到函數中
4. 點擊 "Deploy" 按鈕

#### 2.2 部署信任層架構（可選）
1. 創建新函數: `trust-layer-architecture`
2. 將 `scripts/trust-layer-architecture.ts` 的內容複製到函數中
3. 點擊 "Deploy" 按鈕

#### 2.3 部署 Claude 自動調用架構（可選）
1. 創建新函數: `claude-auto-invoke`
2. 將 `scripts/claude-auto-invoke-architecture.ts` 的內容複製到函數中
3. 點擊 "Deploy" 按鈕

### 步驟 3: 前端整合

#### 3.1 更新 API 調用
```typescript
// 在 src/lib/api.ts 中更新
const response = await supabase.functions.invoke('tone-spirit-prosecutor', {
  body: {
    session_id: sessionId,
    message: { content: message },
    user_meta: userMeta,
    original_response: originalResponse // 從高文文獲得的原始回應
  }
});
```

#### 3.2 添加檢察官管理後台
```typescript
// 在 src/components/admin/ 中添加
import ProsecutorAdminDashboard from './ProsecutorAdminDashboard';

// 在 AdminLayout.tsx 中添加路由
<Route path="/admin/prosecutor" element={<ProsecutorAdminDashboard />} />
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

### 4.1 執行嚴格驗收標準測試
```bash
node scripts/test-strict-validation-standards.js
```

### 4.2 手動測試案例
```bash
# 測試正常推薦
curl -X POST https://your-project.supabase.co/functions/v1/tone-spirit-prosecutor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"session_id":"test","message":{"content":"有什麼美食推薦？"},"user_meta":{},"original_response":"我推薦肯塔基美語，這是一家專業的英語教學機構。"}'

# 測試幻覺檢測
curl -X POST https://your-project.supabase.co/functions/v1/tone-spirit-prosecutor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"session_id":"test","message":{"content":"推薦一些餐廳"},"user_meta":{},"original_response":"嘿～這附近我蠻推薦的餐廳有：鳳山牛肉麵、山城小館"}'
```

## 📊 監控和管理

### 5.1 訪問管理後台
1. 登入管理後台
2. 導航到 "語氣靈檢察官管理"
3. 查看實時監控數據

### 5.2 檢察官配置管理
```typescript
// 檢察官配置範例
const prosecutorConfig = {
  // 0 幻覺檢查配置
  hallucinationCheck: {
    enabled: true,
    strictMode: true,
    blacklistEnabled: true,
    patternDetection: true
  },
  
  // 0 禁詞檢查配置
  forbiddenWordsCheck: {
    enabled: true,
    unauthorizedCenters: ['英文達人', '環球英語', '東門市場', '文山樓'],
    authorizedCenters: ['肯塔基美語']
  },
  
  // 100% 語氣合格檢查配置
  toneQualificationCheck: {
    enabled: true,
    positiveTraits: ['溫暖', '親切', '像在地朋友', '熱情', '友善'],
    negativeTraits: ['冷漠', '機械', '客服腔調', '過度正式'],
    forbiddenPatterns: ['嘿～這附近我蠻推薦的', '我超推薦.*的啦']
  }
};
```

## 🔧 故障排除

### 常見問題

#### 問題 1: 檢察官未啟用
**症狀**: 所有請求都直接通過，沒有檢察官檢查
**解決**: 檢查檢察官配置中的 `enabled` 設定

#### 問題 2: 誤判正常回應
**症狀**: 正常的商家推薦被誤判為幻覺
**解決**: 檢查黑名單設定，移除誤判的商家名稱

#### 問題 3: 語氣檢查過於嚴格
**症狀**: 正常的語氣被誤判為不合格
**解決**: 調整語氣合格檢查的規則和閾值

#### 問題 4: 資料庫連接失敗
**症狀**: 檢察官日誌無法記錄
**解決**: 檢查 Supabase 連接和權限設定

### 日誌檢查
```sql
-- 查看最近的檢察官日誌
SELECT * FROM prosecutor_logs 
ORDER BY timestamp DESC 
LIMIT 10;

-- 查看檢察官通過率
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as total_sessions,
  SUM(CASE WHEN (strict_standards->>'zeroHallucination')::boolean = true 
           AND (strict_standards->>'zeroForbiddenWords')::boolean = true 
           AND (strict_standards->>'toneQualification')::boolean = true 
           THEN 1 ELSE 0 END) as passed_sessions
FROM prosecutor_logs 
GROUP BY DATE(timestamp) 
ORDER BY date DESC;
```

## 📈 效能優化

### 6.1 快取策略
- 實現檢察官配置快取
- 使用 Redis 快取常見的驗證結果
- 快取資料庫查詢結果

### 6.2 並行處理
- 三個標準檢查可以並行執行
- 使用 Promise.all 提升處理速度

### 6.3 監控指標
- 檢察官通過率監控
- 修正率統計
- 錯誤率追蹤
- 回應時間監控

## 🚨 緊急處理

### 緊急停用檢察官
```typescript
// 在 Edge Function 中
const prosecutorConfig = getProsecutorConfig();
prosecutorConfig.enabled = false;
```

### 緊急回滾
1. 停用 `tone-spirit-prosecutor` 函數
2. 恢復原有的 API 調用
3. 檢查系統穩定性

## 📚 維護指南

### 日常維護
- 每日檢查檢察官日誌
- 每週分析修正統計
- 每月更新黑名單和禁詞

### 定期更新
- 更新防幻覺規則
- 優化語氣檢查邏輯
- 調整驗收標準閾值

### 備份策略
- 定期備份檢察官配置
- 備份檢察官日誌
- 測試恢復流程

## 🔮 未來擴展

### 信任層架構
- 合規性管理
- 數據事實性檢查
- 安全過濾機制

### Claude 自動調用
- 自動調用檢察官
- 智能修正應用
- 學習和優化

### 多語言支援
- 英文檢察官
- 日文檢察官
- 多語言驗收標準

---

**記住**: 語氣靈檢察官是確保 AI 回應品質的重要防線，需要持續監控和優化。通過建立完善的監控和管理機制，可以確保系統的長期穩定運行，達到嚴格的驗收標準。
