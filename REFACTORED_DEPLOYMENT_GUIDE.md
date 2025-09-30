# 📚 重構版推薦引擎部署指南

## 🎯 重構成果總覽

### ✨ 核心改進
1. **防幻覺機制強化** - ValidationService 確保 100% 真實商家推薦
2. **統一 Fallback 處理** - FallbackService 提供一致的無結果回應
3. **模組化設計** - 驗證、排序、語氣生成完全分離
4. **評價排序標準化** - SortingService 限制最多 3 筆，以評價排序
5. **完善錯誤處理** - 結構化日誌和異常管理
6. **處理時間監控** - 性能指標追蹤

### 🏗️ 新架構設計

```
重構版五層架構 + 輔助服務
├── 輔助服務類
│   ├── ValidationService    - 防幻覺資料驗證
│   ├── SortingService       - 標準化排序限制
│   └── FallbackService      - 統一 fallback 處理
│
├── 第一層: DataLayer        - 純粹資料庫操作
├── 第二層: IntentLayer      - 意圖分析 (保持不變)
├── 第三層: RecommendationLayer - 整合驗證和排序
├── 第四層: ToneRenderingLayer - 簡化語氣生成
└── 第五層: LoggingLayer     - 強化錯誤追蹤
```

## 🚀 部署步驟

### Step 1: 備份現有版本
```bash
# 備份當前 Edge Function
cp supabase/functions/claude-chat/index.ts supabase/functions/claude-chat/index-backup-$(date +%Y%m%d).ts
```

### Step 2: 部署重構版本
```bash
# 方案 A: 替換現有文件 (推薦用於測試)
cp supabase/functions/claude-chat/index-refactored.ts supabase/functions/claude-chat/index.ts

# 方案 B: 創建新的 Edge Function (推薦用於生產)
# 在 Supabase Dashboard 創建新函數 'claude-chat-v2'
# 複製 index-refactored.ts 內容到新函數
```

### Step 3: 環境變數檢查
確保以下環境變數已設置：
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key  # fallback
```

### Step 4: 執行測試
```bash
# 執行重構版測試腳本
node scripts/test-refactored-recommendation-engine.js
```

### Step 5: 更新前端調用 (如果使用方案 B)
在前端代碼中更新 API 端點：
```typescript
// src/lib/api.ts 或相關文件
const EDGE_FUNCTION_URL = `${supabaseUrl}/functions/v1/claude-chat-v2`
```

## 🧪 測試驗證

### 自動化測試
```bash
# 執行完整測試套件
npm run test:refactored

# 或直接執行測試腳本
node scripts/test-refactored-recommendation-engine.js
```

### 手動驗證清單
- [ ] 英語學習推薦：「我想學英語」→ 肯塔基美語
- [ ] 美食查詢：「有什麼美食推薦？」→ 餐飲商家清單
- [ ] 特定料理：「我想吃日料」→ 統一 fallback 語句
- [ ] 停車查詢：「停車資訊」→ 停車場清單
- [ ] 超出範圍：「台北好玩嗎？」→ 禁止回應外地查詢
- [ ] 統計查詢：「資料庫有多少商家？」→ 統計資訊
- [ ] 空查詢：""→ 錯誤處理

## 📊 性能對比

| 指標 | 原版本 | 重構版本 | 改善 |
|------|--------|----------|------|
| 防幻覺機制 | 部分 | 100% | ✅ 完全防護 |
| Fallback 一致性 | 不統一 | 統一 | ✅ 標準化 |
| 推薦數量控制 | 不一致 | 最多3個 | ✅ 嚴格限制 |
| 排序邏輯 | 分散 | 標準化 | ✅ 多層級排序 |
| 錯誤處理 | 基本 | 結構化 | ✅ 完善追蹤 |
| 處理時間監控 | 無 | 有 | ✅ 性能指標 |
| 代碼可維護性 | 中等 | 高 | ✅ 模組化設計 |

## 🔍 關鍵差異點

### 防幻覺機制
```typescript
// 重構版本增加的驗證
ValidationService.validateStoreData(stores)        // 資料完整性驗證
ValidationService.validateRecommendationLogic()    // 推薦邏輯驗證
```

### 統一 Fallback 處理
```typescript
// 重構前：多處不同的 fallback 邏輯
// 重構後：統一管理
FallbackService.generateContextualFallback(intent, subcategory)
```

### 標準化排序
```typescript
// 重構後：多層級排序 + 嚴格限制
SortingService.sortAndLimitStores(stores, 3)
// 1. 特約商家優先
// 2. 贊助等級排序
// 3. 評分排序
// 4. 限制最多3個
```

## 🚨 注意事項

### 1. 向後相容性
- 重構版本完全向後相容
- API 回應格式保持一致
- 只是內部實現優化

### 2. 資料庫需求
- 確保 `stores` 表有所有必要欄位
- 確認 `recommendation_logs` 表可用
- 檢查 RLS 政策設置

### 3. 環境變數
- 優先使用 `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY` 作為 fallback
- 確保環境變數在 Edge Function 中可用

### 4. 回滾計畫
如果重構版本有問題，可快速回滾：
```bash
# 恢復備份
cp supabase/functions/claude-chat/index-backup-YYYYMMDD.ts supabase/functions/claude-chat/index.ts

# 或在 Supabase Dashboard 中切換到備份版本
```

## 📈 監控指標

### 關鍵指標追蹤
- **處理時間**：目標 < 2000ms
- **錯誤率**：目標 < 1%
- **Fallback 使用率**：監控數據覆蓋度
- **推薦命中率**：非空推薦比例

### 日誌分析
```bash
# 查看 Supabase Edge Function 日誌
# 搜索關鍵字：
# - "[重構版]" - 重構版本標記
# - "validation_layer_enabled: true" - 驗證層狀態
# - "fallback_used" - Fallback 使用情況
# - "processing_time_ms" - 處理時間統計
```

## 🛠️ 後續優化建議

### 1. 短期優化 (1-2週)
- [ ] 監控處理時間，優化慢查詢
- [ ] 分析 fallback 使用率，補強資料覆蓋
- [ ] 收集用戶回饋，調整語氣模板

### 2. 中期優化 (1個月)
- [ ] 實施 A/B 測試比較新舊版本
- [ ] 增加更多特定意圖支援
- [ ] 優化資料庫查詢性能

### 3. 長期規劃 (3個月)
- [ ] 考慮引入機器學習排序
- [ ] 實施個性化推薦
- [ ] 建立推薦效果分析系統

## 📞 技術支援

如果部署過程中遇到問題，可以：

1. **檢查測試結果**：運行測試腳本確認功能正常
2. **查看日誌**：Supabase Dashboard > Edge Functions > Logs
3. **驗證環境**：確認所有環境變數正確設置
4. **回滾版本**：使用備份版本快速恢復

---

**🎉 重構完成！** 您的推薦引擎現在具備了企業級的穩定性、可維護性和防幻覺能力。