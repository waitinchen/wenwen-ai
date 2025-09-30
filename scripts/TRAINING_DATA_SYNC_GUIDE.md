# 訓練資料同步指南

## 概述

本指南說明如何使用訓練資料同步機制，將管理後台的訓練資料同步到 Edge Function 中，確保高文文的回應內容與訓練資料保持一致。

## 工作流程

### 1. 內容管理流程
```
管理員在後台更新訓練資料 → 執行同步腳本 → 重新部署 Edge Function → 高文文使用最新內容
```

### 2. 同步機制
- **保持現狀但優化**：Edge Function 仍然使用 System Prompt，但內容來自訓練資料
- **定期同步**：當訓練資料更新時，執行同步腳本
- **自動備份**：每次同步都會備份原始文件

## 使用方法

### 基本同步
```bash
# 同步訓練資料到 Edge Function
npm run sync:training-data
```

### 完整部署流程
```bash
# 同步 + 生成部署說明
npm run deploy:with-sync
```

## 同步腳本功能

### `scripts/sync-training-data.js`
- 從資料庫獲取所有啟用的訓練資料
- 按類別分組整理
- 生成 System Prompt 片段
- 更新 Edge Function 代碼
- 自動備份原始文件
- 生成同步報告

### `scripts/deploy-with-sync.js`
- 執行完整的同步流程
- 生成部署說明
- 提供下一步操作指引

## 同步後的檔案

### 備份檔案
- `scripts/index.ts.backup.{timestamp}` - 原始 Edge Function 代碼備份

### 報告檔案
- `scripts/sync-report.json` - 同步結果報告
- `scripts/deploy-instructions.md` - 部署說明

## 部署步驟

1. **執行同步**
   ```bash
   npm run sync:training-data
   ```

2. **檢查同步結果**
   ```bash
   cat scripts/sync-report.json
   ```

3. **複製更新後的代碼**
   ```bash
   cat scripts/index.ts
   ```

4. **部署到 Supabase**
   - 前往 Supabase Dashboard
   - Edge Functions → claude-chat
   - 貼上更新後的代碼
   - 點擊 Deploy

5. **驗證部署**
   ```bash
   npm run test:kentucky
   ```

## 訓練資料結構

### 資料庫表：`training_data`
- `question` - 問題內容
- `answer` - 答案內容
- `category` - 分類
- `keywords` - 關鍵詞陣列
- `confidence_score` - 優先級分數
- `is_verified` - 是否已驗證

### 生成的 System Prompt 片段
```
**訓練資料知識庫：**

**教育培訓相關問題：**
- 問題：「文山特區有什麼美語補習班推薦?」
  答案：「文山特區有很多優質的美語補習班!我特別推薦**肯塔基美語**...」
  關鍵詞：美語, 英語, 補習班
  優先級：0.95
```

## 注意事項

### 1. 資料一致性
- 確保訓練資料中的地址資訊正確
- 定期檢查肯塔基美語等特約商家的資訊
- 避免重複或矛盾的內容

### 2. 同步頻率
- 建議每次更新訓練資料後立即同步
- 可以設定定期同步（如每日一次）
- 重要更新應立即部署

### 3. 備份管理
- 每次同步都會自動備份
- 定期清理舊的備份檔案
- 重要版本應手動備份

### 4. 測試驗證
- 同步後務必測試相關功能
- 確認地址資訊正確
- 驗證推薦邏輯正常

## 故障排除

### 同步失敗
1. 檢查資料庫連接
2. 確認訓練資料表存在
3. 檢查檔案權限

### 部署後問題
1. 檢查 Edge Function 日誌
2. 驗證 System Prompt 格式
3. 測試基本功能

### 內容不一致
1. 檢查訓練資料是否已驗證
2. 確認同步腳本執行成功
3. 驗證部署是否完成

## 最佳實踐

1. **內容管理**
   - 在管理後台統一管理所有內容
   - 定期檢查和更新訓練資料
   - 保持內容的準確性和時效性

2. **同步流程**
   - 建立標準化的同步流程
   - 記錄每次同步的內容和時間
   - 建立回滾機制

3. **品質控制**
   - 同步前檢查訓練資料品質
   - 部署後進行功能測試
   - 建立監控和告警機制

## 相關檔案

- `scripts/sync-training-data.js` - 同步腳本
- `scripts/deploy-with-sync.js` - 部署腳本
- `scripts/index.ts` - Edge Function 代碼
- `database-structure.sql` - 資料庫結構
- `src/components/admin/TrainingDataManagement.tsx` - 訓練資料管理介面
