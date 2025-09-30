# WEN 1.4.0 部署檢查清單

## 🎯 版本資訊
- **版本號**：WEN 1.4.0
- **建置號**：20250925-001
- **發布日期**：2025-09-25
- **分支**：fix/wenwen-debug-sprint
- **核心功能**：回應腳本管理系統

---

## 🔍 部署前檢查

### 1. 環境準備
- [ ] Supabase CLI 已安裝並登入
- [ ] 項目參考ID：`vqcuwjfxoxjgsrueqodj`
- [ ] 所需權限已設定（Service Role Key）
- [ ] Node.js 環境準備就緒

### 2. 數據庫檢查
- [ ] 執行數據庫檢查腳本
  ```bash
  psql -h [SUPABASE_HOST] -U postgres -d postgres -f scripts/pre-deployment-db-check.sql
  ```
- [ ] 確認所有必要表格存在
- [ ] 檢查現有 `chat_messages` 和 `stores` 表格完整性

### 3. 檔案檢查
- [ ] `supabase/functions/response-script-management/index.ts` 存在
- [ ] `supabase/functions/claude-chat-v3/index.ts` 存在
- [ ] `src/config/version.ts` 已更新至 WEN 1.4.0
- [ ] 所有相關組件檔案存在

---

## 🚀 部署步驟

### Step 1: 數據庫 Schema 部署
```bash
# 執行數據庫 Schema 部署
psql -h [SUPABASE_HOST] -U postgres -d postgres -f scripts/deploy-db-schema.sql
```

**預期結果**：
- ✅ 7個核心表格創建成功
- ✅ 索引創建完成
- ✅ 觸發器設置完成
- ✅ 初始配置資料插入完成

### Step 2: Edge Functions 部署
```bash
# 方式 1: 使用 Windows 批次檔
scripts/deploy-functions.bat

# 方式 2: 使用 Unix Shell 腳本
scripts/deploy-functions.sh

# 方式 3: 手動部署
supabase functions deploy response-script-management --project-ref vqcuwjfxoxjgsrueqodj
supabase functions deploy claude-chat-v3 --project-ref vqcuwjfxoxjgsrueqodj
```

**預期結果**：
- ✅ response-script-management 函數部署成功
- ✅ claude-chat-v3 函數部署成功

### Step 3: 前端更新
- [ ] 版本號更新確認
- [ ] 新增管理後台路由（如需要）
- [ ] 環境變數設定確認

---

## 🧪 部署後測試

### 1. API 端點測試
```javascript
// 測試回應腳本管理 API
const apiTest = await fetch('https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/response-script-management', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer [SERVICE_ROLE_KEY]'
  },
  body: JSON.stringify({
    action: 'get_pending_queries',
    data: { limit: 5 }
  })
})

// 測試 Claude Chat V3
const chatTest = await fetch('https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/claude-chat-v3', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer [SERVICE_ROLE_KEY]'
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: '你好，我想找美食' }],
    sessionId: 'test-session'
  })
})
```

### 2. 功能測試清單
- [ ] **未知查詢記錄**：系統能正確記錄未知查詢
- [ ] **AI腳本生成**：AI能基於查詢生成合適腳本
- [ ] **人工審核**：審核流程正常運作
- [ ] **知識庫整合**：審核通過的腳本能正確加入知識庫
- [ ] **回應生成**：高文文能使用知識庫回應用戶

### 3. 系統整合測試
- [ ] **前端-後端通信**：管理後台能正常調用API
- [ ] **數據庫寫入**：所有記錄能正確保存
- [ ] **錯誤處理**：異常情況下系統能優雅處理
- [ ] **性能測試**：響應時間在可接受範圍內

---

## 📊 監控與驗證

### 1. 數據庫監控
```sql
-- 檢查核心表格記錄數
SELECT
  'unknown_user_queries' as table_name, COUNT(*) as count FROM unknown_user_queries
UNION ALL
SELECT
  'generated_response_scripts', COUNT(*) FROM generated_response_scripts
UNION ALL
SELECT
  'training_knowledge_base', COUNT(*) FROM training_knowledge_base;

-- 檢查系統配置
SELECT config_key, config_value
FROM system_configurations
WHERE config_key = 'wen_version';
```

### 2. 功能端點監控
- [ ] Response Script Management: `https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/response-script-management`
- [ ] Claude Chat V3: `https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/claude-chat-v3`

### 3. 錯誤日誌檢查
```bash
# 檢查 Edge Functions 日誌
supabase functions logs response-script-management
supabase functions logs claude-chat-v3
```

---

## 🚨 回滾計劃

### 如果部署失敗
1. **數據庫回滾**：
   - 新表格可以保留，不會影響現有功能
   - 如需清理，執行清理腳本

2. **函數回滾**：
   ```bash
   # 回滾到之前版本（如果有）
   supabase functions deploy claude-chat --project-ref vqcuwjfxoxjgsrueqodj
   ```

3. **前端回滾**：
   - 版本號回滾至 WEN 1.3.0
   - 移除新增的路由和組件

---

## ✅ 部署完成確認

### 最終檢查清單
- [ ] 所有 Edge Functions 部署成功
- [ ] 數據庫 Schema 更新完成
- [ ] 版本號正確更新
- [ ] 功能測試全部通過
- [ ] 錯誤日誌無異常
- [ ] 管理後台正常運作
- [ ] 高文文回應品質維持

### 部署成功標誌
- ✅ **API 端點**：兩個新函數都能正常回應
- ✅ **數據流程**：未知查詢 → 腳本生成 → 人工審核 → 知識庫 → 高文文使用
- ✅ **管理界面**：後台能正常管理回應腳本
- ✅ **系統穩定**：現有功能不受影響
- ✅ **版本顯示**：前端顯示 WEN 1.4.0

---

## 📞 緊急聯絡

**部署負責人**：C謀
**部署時間**：2025-09-25
**預估完成時間**：30分鐘
**風險等級**：中等（新增功能，不影響現有系統）

---

**注意事項**：
- 此版本為新增功能，不會破壞現有系統
- 所有新表格使用 `IF NOT EXISTS` 安全創建
- Edge Functions 為新函數，不會覆蓋現有功能
- 建議在低峰時段部署以確保穩定性