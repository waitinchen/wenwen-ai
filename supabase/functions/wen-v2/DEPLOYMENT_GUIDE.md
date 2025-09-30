# 語氣靈推薦引擎 v2.0 部署指南

## 📋 部署前準備

### 1. 環境變數配置
確保以下環境變數已正確設置：
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SERVICE_ROLE_KEY=your-service-role-key
CLAUDE_API_KEY=your-claude-api-key
CLAUDE_MODEL=claude-3-haiku-20240307
```

### 2. 資料庫表結構確認
確保以下表格存在且結構正確：
- `stores` - 商家資料表
- `user_profiles` - 用戶資料表
- `chat_sessions` - 聊天會話表
- `chat_messages` - 聊天訊息表

## 🚀 部署步驟

### 方法一：Supabase Dashboard 部署

1. **登入 Supabase Dashboard**
   - 前往 [Supabase Dashboard](https://supabase.com/dashboard)
   - 選擇您的專案

2. **創建新的 Edge Function**
   ```bash
   # 在 Supabase Dashboard 中：
   # Edge Functions > Create new function
   # Function name: wen-v2
   ```

3. **複製主程式碼**
   - 複製 `supabase/functions/wen-v2/index.ts` 的內容
   - 貼上到 Supabase Dashboard 的編輯器中

4. **部署函數**
   - 點擊 "Deploy" 按鈕
   - 等待部署完成

### 方法二：Supabase CLI 部署

1. **安裝 Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **登入 Supabase**
   ```bash
   supabase login
   ```

3. **連結專案**
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **部署函數**
   ```bash
   supabase functions deploy wen-v2
   ```

## 🔧 模組化部署（進階）

如果需要單獨部署各個模組：

### 1. 部署資料層模組
```bash
# 複製 data-layer.ts 到 Supabase 專案中
cp supabase/functions/wen-v2/lib/data-layer.ts supabase/functions/wen-v2/
```

### 2. 部署工具模組
```bash
# 複製工具模組
cp supabase/functions/wen-v2/lib/utils/* supabase/functions/wen-v2/lib/utils/
```

### 3. 部署語氣模板
```bash
# 複製語氣模板
cp supabase/functions/wen-v2/templates/* supabase/functions/wen-v2/templates/
```

## 🧪 測試部署

### 1. 基本功能測試
```bash
# 測試函數是否正常運行
curl -X POST https://your-project.supabase.co/functions/v1/wen-v2 \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-session",
    "message": {"role": "user", "content": "有什麼美食推薦？"},
    "user_meta": {
      "external_id": "test-user",
      "display_name": "測試用戶"
    }
  }'
```

### 2. 完整測試腳本
```bash
# 運行測試腳本
deno run --allow-net --allow-env supabase/functions/wen-v2/test-engine.ts
```

## 📊 監控與維護

### 1. 日誌監控
- 在 Supabase Dashboard 中查看 Edge Function 日誌
- 監控錯誤率和回應時間

### 2. 性能監控
- 使用 `fetchMonitor` 監控請求統計
- 定期檢查幻覺防線的攔截記錄

### 3. 資料庫監控
- 監控 `chat_messages` 表的增長
- 檢查用戶行為分析數據

## 🔄 版本更新流程

### 1. 備份現有版本
```bash
# 備份當前版本
supabase functions download wen-v2 --output backup/
```

### 2. 更新程式碼
- 修改相應模組的程式碼
- 更新版本號和變更日誌

### 3. 測試新版本
```bash
# 在測試環境部署
supabase functions deploy wen-v2 --no-verify-jwt
```

### 4. 正式部署
```bash
# 部署到正式環境
supabase functions deploy wen-v2
```

## 🛠️ 故障排除

### 常見問題

1. **環境變數未設置**
   ```bash
   # 檢查環境變數
   supabase secrets list
   ```

2. **模組導入錯誤**
   - 確保所有模組檔案都在正確位置
   - 檢查 import 路徑

3. **資料庫連接失敗**
   - 檢查 SERVICE_ROLE_KEY 是否正確
   - 確認資料庫表結構

4. **Claude API 錯誤**
   - 檢查 CLAUDE_API_KEY 是否有效
   - 確認 API 配額是否充足

### 日誌分析
```bash
# 查看函數日誌
supabase functions logs wen-v2 --follow
```

## 📈 性能優化

### 1. 快取策略
- 實現商家資料快取
- 使用 Redis 或記憶體快取

### 2. 併發控制
- 限制同時處理的請求數量
- 實現請求佇列機制

### 3. 資料庫優化
- 為常用查詢添加索引
- 優化 SQL 查詢語句

## 🔒 安全考量

### 1. API 安全
- 使用 JWT 驗證
- 實施速率限制

### 2. 資料安全
- 加密敏感資料
- 實施資料脫敏

### 3. 輸入驗證
- 驗證所有輸入參數
- 防止 SQL 注入

## 📚 相關文檔

- [Supabase Edge Functions 文檔](https://supabase.com/docs/guides/functions)
- [Deno 運行時文檔](https://deno.land/manual)
- [Claude API 文檔](https://docs.anthropic.com/)

## 🆘 支援

如有問題，請：
1. 檢查日誌文件
2. 查看 Supabase Dashboard 的錯誤信息
3. 聯繫技術支援團隊
