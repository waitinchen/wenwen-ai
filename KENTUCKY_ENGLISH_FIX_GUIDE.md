# 肯塔基美語優先推薦修復指南

## 🚨 問題描述

用戶查詢「我想學美語」時，高文文沒有優先推薦肯塔基美語，而是推薦了其他補習班。

## ✅ 修復狀態

### 已完成的修復
1. **擴展關鍵字檢測** - 新增「我想學」、「學美語」等關鍵字
2. **強化強制推薦邏輯** - 明確禁止推薦其他補習班
3. **添加禁止事項** - 防止推薦競爭對手
4. **增加調試日誌** - 方便追蹤問題

### 修復的檔案
- `supabase/functions/claude-chat/index.ts` - 強化肯塔基美語推薦邏輯

### 測試結果
- **邏輯測試**: ✅ 正確檢測到「我想學美語」為英語相關問題
- **關鍵字檢測**: ✅ 檢測到 ['美語', '學美語', '我想學']
- **應該觸發**: ✅ 應該觸發肯塔基美語推薦

## 🔧 需要完成的步驟

### 1. 重新部署 Edge Function

#### 方法一：使用 Supabase Dashboard
1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇專案：`vqcuwjfxoxjgsrueqodj`
3. 進入 **Edge Functions** 頁面
4. 找到 `claude-chat` 函數
5. 點擊 **Deploy** 按鈕重新部署

#### 方法二：使用 Supabase CLI
```bash
# 安裝 Supabase CLI (Windows)
# 下載並安裝：https://github.com/supabase/cli/releases

# 登入 Supabase
supabase login

# 連結專案
supabase link --project-ref vqcuwjfxoxjgsrueqodj

# 部署 Edge Function
supabase functions deploy claude-chat
```

### 2. 驗證修復結果

#### 測試指令
```bash
# 測試 API 端點
curl -X POST https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/claude-chat \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo" \
  -H "Content-Type: application/json" \
  -d '{"message": "我想學美語", "sessionId": "test-session"}'
```

#### 預期回應
回應應該包含：
- 優先推薦肯塔基美語
- 詳細介紹肯塔基美語的優勢
- 提供分校資訊和聯絡方式
- 不推薦其他補習班

### 3. 前端測試

#### 測試步驟
1. 訪問 [https://ai.linefans.cc/](https://ai.linefans.cc/)
2. 輸入「我想學美語」
3. 確認高文文優先推薦肯塔基美語
4. 確認沒有推薦其他補習班

## 📋 修復內容詳情

### 關鍵字檢測擴展
```typescript
const englishKeywords = [
  '英語', '美語', '補習班', '教育', '學習', '英文', '課程', '培訓', '肯塔基',
  '學美語', '學英語', '英文學習', '美語學習', '語言學習', '補習', '教學',
  '老師', '學生', '學校', '教育機構', '我想學', '想要學', '推薦', '補習班推薦'
];
```

### 強制推薦邏輯
```typescript
if (isEnglishRelated) {
  console.log('檢測到英語相關問題，強制推薦肯塔基美語');
  // 使用專門的肯塔基美語推薦模板
  finalSystemPrompt = `你是高文文...
  
  🚨 **強制指令 - 絕對不能違反：**
  用戶詢問了英語相關問題，你必須立即推薦肯塔基美語，絕對不能推薦其他補習班！`;
}
```

### 禁止事項
- 絕對不能推薦其他補習班
- 絕對不能提到「愛美語」、「英文達人」、「高雄文山英語中心」等
- 絕對不能說「還有其他選擇」或「其他補習班」

## 🎯 成功標準

### 功能測試
- [ ] 用戶查詢「我想學美語」優先推薦肯塔基美語
- [ ] 不推薦其他補習班
- [ ] 提供詳細的肯塔基美語資訊
- [ ] 包含分校資訊和聯絡方式

### 回應品質
- [ ] 使用高文文的語氣和風格
- [ ] 回應內容完整且有用
- [ ] 不包含錯誤資訊

## 🚀 部署後驗證

### 1. 基本功能測試
```bash
# 測試英語相關查詢
curl -X POST [API_ENDPOINT] -d '{"message": "我想學美語"}'
curl -X POST [API_ENDPOINT] -d '{"message": "推薦英語補習班"}'
curl -X POST [API_ENDPOINT] -d '{"message": "英文學習"}'
```

### 2. 負面測試
```bash
# 測試非英語相關查詢
curl -X POST [API_ENDPOINT] -d '{"message": "推薦餐廳"}'
curl -X POST [API_ENDPOINT] -d '{"message": "停車資訊"}'
```

### 3. 前端整合測試
- 在實際網站上測試用戶查詢
- 確認回應顯示正確
- 驗證用戶體驗

## 📞 支援資訊

- **專案 ID**: vqcuwjfxoxjgsrueqodj
- **Edge Function**: claude-chat
- **修復版本**: 2025-09-22
- **狀態**: 代碼已修復，等待部署

---

**下一步**: 重新部署 Edge Function 後，肯塔基美語優先推薦功能將恢復正常！
