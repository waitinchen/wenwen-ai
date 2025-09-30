# WEN 1.4.0 最終部署執行指南

## 🎯 執行摘要
**版本**：WEN 1.4.0
**部署日期**：2025-09-25
**核心功能**：高文文回應腳本管理系統
**預估執行時間**：20-30分鐘
**風險等級**：低（新增功能，不影響現有系統）

---

## 🗂️ 部署文件總覽

### 已準備的部署文件
1. **`scripts/pre-deployment-db-check.sql`** - 數據庫部署前檢查
2. **`scripts/deploy-db-schema.sql`** - 數據庫Schema安全部署
3. **`scripts/deploy-functions.bat`** - Windows Edge Functions 部署腳本
4. **`scripts/deploy-functions.sh`** - Unix Edge Functions 部署腳本
5. **`src/config/version.ts`** - 版本配置（已更新至WEN 1.4.0）
6. **`scripts/test-wen-1.4.0-deployment.js`** - 部署後綜合測試腳本
7. **`scripts/WEN-1.4.0-DEPLOYMENT-CHECKLIST.md`** - 詳細檢查清單

### 核心功能文件
1. **`supabase/functions/response-script-management/index.ts`** - 回應腳本管理API
2. **`supabase/functions/claude-chat-v3/index.ts`** - 知識庫驅動聊天系統
3. **數據庫Schema** - 7個核心表格完整設計

---

## ⚡ 快速部署執行步驟

### 步驟 1: 環境檢查 (2分鐘)
```bash
# 檢查 Supabase CLI
supabase --version

# 檢查登入狀態
supabase auth --project-ref vqcuwjfxoxjgsrueqodj status

# 檢查 Node.js
node --version
```

### 步驟 2: 數據庫部署 (5分鐘)
```bash
# 1. 執行部署前檢查
psql -h db.vqcuwjfxoxjgsrueqodj.supabase.co -U postgres -f scripts/pre-deployment-db-check.sql

# 2. 部署數據庫 Schema
psql -h db.vqcuwjfxoxjgsrueqodj.supabase.co -U postgres -f scripts/deploy-db-schema.sql
```

**預期輸出**：
```
=== WEN 1.4.0 數據庫檢查開始 ===
✅ 表格存在: chat_messages
✅ 表格存在: stores
✅ 所有必需表格都已存在，可以進行部署
=== 數據庫檢查完成 ===

🚀 開始部署 WEN 1.4.0 數據庫Schema...
✅ WEN 1.4.0 數據庫Schema部署完成！
```

### 步驟 3: Edge Functions 部署 (8分鐘)
```bash
# Windows 用戶
scripts\deploy-functions.bat

# 或 Unix/Linux/Mac 用戶
scripts/deploy-functions.sh

# 或手動部署
supabase functions deploy response-script-management --project-ref vqcuwjfxoxjgsrueqodj
supabase functions deploy claude-chat-v3 --project-ref vqcuwjfxoxjgsrueqodj
```

**預期輸出**：
```
🚀 WEN 1.4.0 Edge Functions 部署腳本
✅ response-script-management 函數文件存在
✅ claude-chat-v3 函數文件存在
✅ response-script-management 部署成功
✅ claude-chat-v3 部署成功
🎉 所有 Edge Functions 部署完成！
```

### 步驟 4: 部署後測試 (8分鐘)
```bash
# 設定環境變數
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 執行綜合測試
node scripts/test-wen-1.4.0-deployment.js
```

**預期輸出**：
```
🚀 WEN 1.4.0 部署後綜合測試開始
✅ 通過 數據庫連接
✅ 通過 未知查詢記錄
✅ 通過 AI腳本生成
✅ 通過 人工審核
✅ 通過 知識庫搜索
✅ 通過 Claude Chat V3 整合
📊 測試結果摘要: ✅ 通過: 8 項 | ❌ 失敗: 0 項 | 📈 成功率: 100%
🎉 恭喜！WEN 1.4.0 回應腳本管理系統部署完成且功能正常！
```

### 步驟 5: 驗證確認 (5分鐘)
```bash
# 檢查 Edge Functions 狀態
supabase functions list --project-ref vqcuwjfxoxjgsrueqodj

# 檢查 Edge Functions 日誌
supabase functions logs response-script-management --project-ref vqcuwjfxoxjgsrueqodj
supabase functions logs claude-chat-v3 --project-ref vqcuwjfxoxjgsrueqodj
```

---

## 🚨 故障排除

### 常見問題及解決方案

#### 問題 1: 數據庫連接失敗
```bash
# 解決方案
# 1. 檢查密碼是否正確
# 2. 確認網路連接
# 3. 使用正確的主機名稱
psql -h db.vqcuwjfxoxjgsrueqodj.supabase.co -U postgres -c "SELECT version();"
```

#### 問題 2: Edge Functions 部署失敗
```bash
# 解決方案
# 1. 檢查 Supabase CLI 登入狀態
supabase auth status

# 2. 重新登入
supabase auth login

# 3. 手動部署單個函數
supabase functions deploy response-script-management --project-ref vqcuwjfxoxjgsrueqodj --debug
```

#### 問題 3: 測試腳本失敗
```bash
# 解決方案
# 1. 確認環境變數設定
echo $SUPABASE_SERVICE_ROLE_KEY

# 2. 檢查 API 端點是否可訪問
curl -I https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/response-script-management

# 3. 查看詳細錯誤日誌
node scripts/test-wen-1.4.0-deployment.js 2>&1 | tee deployment-test.log
```

---

## ✅ 成功部署標誌

### 系統狀態確認
- [ ] **數據庫**：7個新表格創建成功，無錯誤
- [ ] **API端點**：兩個新函數都能正常響應
- [ ] **版本號**：前端顯示 WEN 1.4.0
- [ ] **測試通過**：綜合測試 100% 通過
- [ ] **日誌無誤**：Edge Functions 日誌無異常

### 功能流程驗證
1. **未知查詢記錄** ✅ - 系統能記錄新用戶查詢
2. **AI腳本生成** ✅ - AI能基於查詢生成回應腳本
3. **人工審核** ✅ - 審核流程完整運作
4. **知識庫整合** ✅ - 通過審核的腳本加入知識庫
5. **智能回應** ✅ - 高文文使用知識庫回應用戶

---

## 📞 後續步驟

### 立即執行
1. **通知團隊**：部署完成，新功能已上線
2. **文檔更新**：更新API文檔和使用手冊
3. **監控設定**：設置監控告警，關注系統性能

### 本週內執行
1. **用戶培訓**：管理員後台新功能培訓
2. **數據收集**：開始收集未知查詢和腳本生成數據
3. **品質優化**：根據初期數據調整AI生成參數

### 本月內執行
1. **效果評估**：分析知識庫成長和回應品質提升
2. **功能擴展**：根據使用情況添加新功能
3. **性能優化**：資料庫和API性能調優

---

## 📋 部署記錄

**部署執行人**：________________
**開始時間**：____年____月____日 ____時____分
**完成時間**：____年____月____日 ____時____分
**遇到問題**：

- [ ] 無問題，順利完成
- [ ] 遇到問題但已解決：________________
- [ ] 遇到問題未解決：________________

**最終狀態**：
- [ ] ✅ 部署成功，所有功能正常
- [ ] ⚠️ 部署完成，部分功能需要調整
- [ ] ❌ 部署失敗，需要回滾

**簽名**：________________ **日期**：________________

---

*WEN 1.4.0 - 高文文回應腳本管理系統*
*讓高文文越來越聰明！🎉*