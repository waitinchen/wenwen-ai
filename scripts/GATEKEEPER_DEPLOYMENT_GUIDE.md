# 🔒 把關系統部署指南

## 📋 系統概述

五層架構管理師是一個智能的對話把關系統，在高文文回應之前進行多層驗證和修正，確保回應的準確性和安全性。

### 架構設計
```
用戶訊息 → 高文文回應 → 五層把關 → 最終回應
                ↓
        Layer 1: 資料優先驗證層
        Layer 2: 知識庫驗證層  
        Layer 3: 內容合理性分析層
        Layer 4: 互動攔截與修正層
        Layer 5: 最終把關與放行層
```

## 🚀 部署步驟

### 步驟 1: 資料庫準備

#### 1.1 創建把關日誌表
```sql
-- 創建把關日誌表
CREATE TABLE IF NOT EXISTS gatekeeping_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  original_response TEXT NOT NULL,
  final_response TEXT NOT NULL,
  corrections TEXT[] DEFAULT '{}',
  validation_results JSONB DEFAULT '[]',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_gatekeeping_logs_session_id ON gatekeeping_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_gatekeeping_logs_timestamp ON gatekeeping_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_gatekeeping_logs_corrections ON gatekeeping_logs USING GIN(corrections);
```

#### 1.2 創建配置管理表
```sql
-- 創建配置管理表
CREATE TABLE IF NOT EXISTS gatekeeper_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config_name TEXT NOT NULL UNIQUE,
  config_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入預設配置
INSERT INTO gatekeeper_config (config_name, config_data, is_active) VALUES
('default', '{
  "version": "WEN 1.2.0-GATEKEEPER",
  "enabled": true,
  "layers": {
    "layer1": {"enabled": true, "priority": 1, "timeout": 5000},
    "layer2": {"enabled": true, "priority": 2, "timeout": 3000},
    "layer3": {"enabled": true, "priority": 3, "timeout": 4000},
    "layer4": {"enabled": true, "priority": 4, "timeout": 2000},
    "layer5": {"enabled": true, "priority": 5, "timeout": 1000}
  },
  "thresholds": {
    "maxCorrections": 5,
    "maxResponseTime": 10000,
    "minConfidenceScore": 0.7
  },
  "blacklists": {
    "stores": ["鳳山牛肉麵", "山城小館", "Coz Pizza", "好客食堂", "福源小館"],
    "phrases": ["嘿～這附近我蠻推薦的", "我超推薦.*的啦"],
    "patterns": ["嘿～這附近我蠻推薦的", "我超推薦.*的啦"]
  }
}', true);
```

### 步驟 2: Edge Function 部署

#### 2.1 部署把關整合服務
1. 前往 Supabase Dashboard > Edge Functions
2. 創建新函數: `gatekeeper-integration`
3. 將 `scripts/gatekeeper-integration.ts` 的內容複製到函數中
4. 點擊 "Deploy" 按鈕

#### 2.2 部署獨立把關服務（可選）
1. 創建新函數: `gatekeeper-standalone`
2. 將 `scripts/gatekeeper-system-architecture.ts` 的內容複製到函數中
3. 點擊 "Deploy" 按鈕

### 步驟 3: 前端整合

#### 3.1 更新 API 調用
```typescript
// 在 src/lib/api.ts 中更新
const response = await supabase.functions.invoke('gatekeeper-integration', {
  body: {
    session_id: sessionId,
    message: { content: message },
    user_meta: userMeta
  }
});
```

#### 3.2 添加管理後台組件
```typescript
// 在 src/components/admin/ 中添加
import GatekeeperAdminDashboard from './GatekeeperAdminDashboard';

// 在 AdminLayout.tsx 中添加路由
<Route path="/admin/gatekeeper" element={<GatekeeperAdminDashboard />} />
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

### 4.1 執行測試腳本
```bash
node scripts/test-gatekeeper-system.js
```

### 4.2 手動測試案例
```bash
# 測試正常推薦
curl -X POST https://your-project.supabase.co/functions/v1/gatekeeper-integration \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"session_id":"test","message":{"content":"有什麼美食推薦？"},"user_meta":{}}'

# 測試幻覺檢測
curl -X POST https://your-project.supabase.co/functions/v1/gatekeeper-integration \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"session_id":"test","message":{"content":"推薦一些餐廳"},"user_meta":{},"original_response":"嘿～這附近我蠻推薦的餐廳有：鳳山牛肉麵、山城小館"}'
```

## 📊 監控和管理

### 5.1 訪問管理後台
1. 登入管理後台
2. 導航到 "把關系統管理"
3. 查看實時監控數據

### 5.2 配置管理
```typescript
import { getConfigManager } from './gatekeeper-config-manager';

const configManager = getConfigManager();

// 啟用/停用把關系統
configManager.setEnabled(true);

// 更新黑名單
configManager.updateBlacklist('stores', ['新商家1', '新商家2']);

// 調整閾值
configManager.updateThresholds({
  maxCorrections: 3,
  maxResponseTime: 8000
});
```

## 🔧 故障排除

### 常見問題

#### 問題 1: 把關系統未啟用
**症狀**: 所有請求都直接通過，沒有把關檢查
**解決**: 檢查配置中的 `enabled` 設定

#### 問題 2: 回應時間過長
**症狀**: 用戶等待時間超過 10 秒
**解決**: 調整各層的 `timeout` 設定

#### 問題 3: 誤判正常回應
**症狀**: 正常的商家推薦被誤判為幻覺
**解決**: 檢查黑名單設定，移除誤判的商家名稱

#### 問題 4: 資料庫連接失敗
**症狀**: 把關日誌無法記錄
**解決**: 檢查 Supabase 連接和權限設定

### 日誌檢查
```sql
-- 查看最近的把關日誌
SELECT * FROM gatekeeping_logs 
ORDER BY timestamp DESC 
LIMIT 10;

-- 查看修正統計
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as total_sessions,
  SUM(array_length(corrections, 1)) as total_corrections
FROM gatekeeping_logs 
GROUP BY DATE(timestamp) 
ORDER BY date DESC;
```

## 📈 效能優化

### 6.1 快取策略
- 實現配置快取，減少資料庫查詢
- 使用 Redis 快取常見的驗證結果

### 6.2 並行處理
- 各層驗證可以並行執行
- 使用 Promise.all 提升處理速度

### 6.3 監控指標
- 回應時間監控
- 修正率統計
- 錯誤率追蹤

## 🚨 緊急處理

### 緊急停用把關系統
```typescript
// 在 Edge Function 中
const configManager = getConfigManager();
configManager.setEnabled(false);
```

### 緊急回滾
1. 停用 `gatekeeper-integration` 函數
2. 恢復原有的 API 調用
3. 檢查系統穩定性

## 📚 維護指南

### 日常維護
- 每日檢查把關日誌
- 每週分析修正統計
- 每月更新黑名單

### 定期更新
- 更新防幻覺規則
- 優化驗證邏輯
- 調整閾值參數

### 備份策略
- 定期備份配置資料
- 備份把關日誌
- 測試恢復流程

---

**記住**: 把關系統是保護用戶體驗的重要防線，需要持續監控和優化。通過建立完善的監控和管理機制，可以確保系統的長期穩定運行。
