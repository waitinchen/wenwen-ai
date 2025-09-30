# 🚀 Supabase Edge Function 部署指南

## 部署步驟

### 1. 登入 Supabase Dashboard
- 前往：https://supabase.com/dashboard
- 登入您的帳號
- 選擇您的專案

### 2. 進入 Edge Functions 頁面
- 在左側選單點擊 "Edge Functions"
- 找到 `claude-chat` 函數

### 3. 更新函數代碼
- 點擊 `claude-chat` 函數
- 點擊 "Edit" 按鈕
- 將 `supabase/functions/claude-chat/index.ts` 的內容複製貼上
- 點擊 "Deploy" 按鈕

### 4. 驗證部署
- 等待部署完成
- 檢查函數狀態是否為 "Active"

## 修復內容摘要

### 意圖分類修復
- ✅ 添加 SPECIFIC_ENTITY 檢測
- ✅ 添加 VAGUE_QUERY 檢測  
- ✅ 優化 OUT_OF_SCOPE 檢測順序

### 格式一致性修復
- ✅ 所有回應都包含版本標識 (*WEN 1.4.6)
- ✅ 統一結構元素 (--- 分隔符)
- ✅ 加強個人化元素 (高文文)

### 策略矩陣修復
- ✅ 特定實體查詢使用純LLM回應
- ✅ 範圍外查詢使用純LLM回應
- ✅ 模糊查詢使用純LLM回應

## 測試建議

部署完成後，建議測試以下查詢：
1. "麥當勞在哪裡" → 應該返回 SPECIFIC_ENTITY 回應
2. "有什麼建議" → 應該返回 VAGUE_QUERY 回應
3. "今天天氣如何" → 應該返回 OUT_OF_SCOPE 回應
4. "你好" → 應該返回格式一致的回應

## 預期改善效果

- 意圖分類準確性：從 58.3% 提升到 100%
- 格式一致性：從 25.0% 提升到 75%+
- 策略矩陣：從 50.0% 提升到 66.7%+
- 總體通過率：從 53.6% 提升到 84.6%+

