# 🚀 高文文調試衝刺修復指南

## 📋 修復內容

### ✅ 已完成的修復：

1. **聊天 API 格式修復**
   - 新格式：`{ session_id, message: { role, content }, user_meta: { external_id, display_name, avatar_url } }`
   - 支援用戶暱稱和頭像傳遞
   - 確保連續對話使用同一 session_id

2. **特約商家布林值轉換**
   - 添加 `toBool` 函數：`const toBool = (v: any): boolean => v === true || v === 'true'`
   - 更新所有 `sanitizeBoolean` 函數使用新的 `toBool`
   - 確保前後端布林值一致性

3. **後台對話歷史管理**
   - 支援新的用戶元資料格式
   - 優先顯示 user_meta 中的暱稱和頭像
   - 向後相容 line_users 資料

4. **Edge Function 更新**
   - 支援新的 API 請求格式
   - 正確處理用戶元資料
   - 保持肯塔基美語優先推薦邏輯

## 🚨 需要立即部署的修復

### Edge Function 部署

**目前狀態**：Edge Function 返回 500 錯誤，需要重新部署

**部署步驟**：

1. **前往 Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/vqcuwjfxoxjgsrueqodj/functions
   ```

2. **找到 `claude-chat` 函數**
   - 點擊 "程式碼" 標籤
   - 複製 `scripts/complete-edge-function-code.ts` 的內容
   - 貼到編輯器中

3. **確認關鍵修復**
   ```typescript
   // 新的請求格式處理
   const { session_id, message, user_meta } = await req.json();
   const messageContent = message.content;
   
   // 用戶元資料處理
   const displayName = userMeta?.display_name || lineUser?.line_display_name || `用戶 ${session.client_ip || '未知'}`;
   const avatarUrl = userMeta?.avatar_url || lineUser?.line_avatar_url;
   ```

4. **點擊 "部署更新" 按鈕**

### 驗證修復

部署完成後執行：
```bash
npm run debug:wenwen
```

預期結果：
- ✅ 新 API 格式測試通過
- ✅ 連續對話使用相同 session_id
- ✅ 英語問題推薦肯塔基美語
- ✅ 非英語問題不推薦肯塔基美語
- ✅ 特約商家布林值正確轉換

## 🔧 技術細節

### API 格式變更

**舊格式**：
```javascript
{
  message: "我想學美語",
  sessionId: "session-123",
  line_uid: "user-456"
}
```

**新格式**：
```javascript
{
  session_id: "session-123",
  message: { 
    role: "user", 
    content: "我想學美語" 
  },
  user_meta: {
    external_id: "user-456",
    display_name: "用戶暱稱",
    avatar_url: "https://example.com/avatar.jpg"
  }
}
```

### 布林值轉換

**新的 toBool 函數**：
```typescript
const toBool = (v: any): boolean => v === true || v === 'true'
```

**使用範例**：
```typescript
data.is_partner_store = toBool(req.body.is_partner_store);
```

## 📊 測試結果

### 當前狀態
- ❌ Edge Function 返回 500 錯誤（需要重新部署）
- ✅ 特約商家查詢正常
- ✅ 前端 API 格式已修復
- ✅ 後台顯示邏輯已更新

### 部署後預期
- ✅ 新 API 格式完全正常
- ✅ 連續對話 session 持久化
- ✅ 用戶暱稱和頭像正確顯示
- ✅ 肯塔基美語優先推薦邏輯正常

## 🎯 下一步

1. **立即部署 Edge Function**
2. **執行測試驗證**
3. **檢查後台對話歷史顯示**
4. **確認特約商家功能正常**

---

**高文文調試衝刺 v1.0** - 專注聊天與商家推薦功能 🚀
