# 前台對話完整保存實施指南

## 📋 概述

本指南提供前台對話完整保存的一次到位解決方案，確保用戶資料（暱稱、頭像）與訊息一起保存到後台對話歷史記錄中。

## 🎯 解決方案架構

### 1. 資料模型 (Database Schema)

#### 新增 `user_profiles` 表
```sql
CREATE TABLE user_profiles (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  external_id VARCHAR(255) UNIQUE, -- 前台 cookie / deviceId
  display_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 更新 `chat_sessions` 表
```sql
-- 新增欄位
ALTER TABLE chat_sessions ADD COLUMN user_id VARCHAR(255) REFERENCES user_profiles(id);
ALTER TABLE chat_sessions ADD COLUMN last_message_preview TEXT;

-- 重新命名欄位
ALTER TABLE chat_sessions RENAME COLUMN user_ip TO client_ip;
ALTER TABLE chat_sessions RENAME COLUMN last_activity TO last_active;
```

#### 更新 `chat_messages` 表
```sql
-- 重新命名欄位
ALTER TABLE chat_messages RENAME COLUMN message_type TO role;
ALTER TABLE chat_messages RENAME COLUMN message_text TO content;
```

### 2. 後端 API 契約

#### 請求格式
```typescript
POST /api/chat/message
Content-Type: application/json
Idempotency-Key: <uuid-v4>

{
  "session_id": "cuid-or-null",
  "message": {
    "role": "user",
    "content": "停車資訊"
  },
  "user_meta": {
    "external_id": "cookie_or_device_id",
    "display_name": "兔貝比",
    "avatar_url": "https://.../avatar.png"
  },
  "context": {
    "client_ip": "x-forwarded-for",
    "user_agent": "UA"
  }
}
```

#### 回應格式
```typescript
{
  "ok": true,
  "session_id": "xxx",
  "assistant": { "content": "...回覆..." }
}
```

### 3. 前端實施

#### 用戶資料管理
```typescript
// 生成或獲取外部 ID
function getOrSetExternalId(): string {
  const COOKIE_NAME = 'wenwen_client_id'
  const existingId = getCookie(COOKIE_NAME)
  
  if (existingId) return existingId
  
  const newId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  setCookie(COOKIE_NAME, newId, 365)
  return newId
}
```

#### 發送訊息
```typescript
const response = await sendChatMessage(
  sessionId || null,
  content,
  displayName,    // 用戶顯示名稱
  avatarUrl       // 用戶頭像 URL
)
```

### 4. 後端處理流程

1. **Upsert 使用者資料**
   ```typescript
   const user = await prisma.userProfile.upsert({
     where: { external_id: user_meta.external_id ?? "anon" },
     update: {
       display_name: user_meta.display_name,
       avatar_url: user_meta.avatar_url
     },
     create: {
       external_id: user_meta.external_id ?? "anon",
       display_name: user_meta.display_name ?? "訪客",
       avatar_url: user_meta.avatar_url
     }
   })
   ```

2. **處理會話**
   ```typescript
   const session = session_id
     ? await prisma.chatSession.update({
         where: { id: session_id },
         data: { last_active: new Date() }
       })
     : await prisma.chatSession.create({
         data: {
           user_id: user.id,
           client_ip: context?.client_ip ?? null,
           user_agent: context?.user_agent ?? null
         }
       })
   ```

3. **儲存訊息**
   ```typescript
   await prisma.chatMessage.create({
     data: {
       session_id: session.id,
       role: message.role,
       content: message.content
     }
   })
   ```

4. **更新會話摘要**
   ```typescript
   await prisma.chatSession.update({
     where: { id: session.id },
     data: {
       message_count: { increment: 1 },
       last_message_preview: message.content.slice(0, 80)
     }
   })
   ```

### 5. 後台查詢 (JOIN UserProfile)

#### 會話列表查詢
```sql
SELECT s.id, s.last_active, s.message_count, s.last_message_preview,
       u.display_name, u.avatar_url
FROM chat_sessions s
JOIN user_profiles u ON u.id = s.user_id
ORDER BY s.last_active DESC
LIMIT 50 OFFSET 0;
```

#### 會話詳情查詢
```sql
SELECT m.role, m.content, m.created_at,
       u.display_name, u.avatar_url
FROM chat_messages m
JOIN chat_sessions s ON s.id = m.session_id
JOIN user_profiles u ON u.id = s.user_id
WHERE m.session_id = $1
ORDER BY m.created_at ASC;
```

## 🚀 實施步驟

### 步驟 1: 資料庫遷移
```bash
npm run migrate:chat
```

### 步驟 2: 部署後端 API
```bash
# 部署 Supabase Edge Function
supabase functions deploy chat-message
```

### 步驟 3: 更新前端
```bash
# 更新聊天界面
npm run build
```

### 步驟 4: 驗收測試
```bash
npm run test:chat-persistence
```

## 🧪 驗收清單

### 1. 新開瀏覽器無痕 → 設暱稱與頭像 → 發 1 句話
- [ ] 後台列表要看到：暱稱、頭像、最後一句
- [ ] 會話詳情要顯示用戶資料

### 2. 連續發 3 句話（同 session）
- [ ] 後台該會話 `message_count = 3`
- [ ] 詳情頁有三條 user/assistant 對話

### 3. 換裝置（不同 external_id）
- [ ] 另開新會話
- [ ] 後台兩筆會話各自有各自的暱稱/頭像

### 4. 重新整理頁面後再講話（同 cookie）
- [ ] 不會新開會話
- [ ] 仍然追加到原會話

## 🔧 常見問題解決

### 問題 1: 後台顯示 "unknown-client"
**原因**: 前端沒有傳送 `user_meta`
**解決**: 確保每次發送訊息都包含 `display_name` 和 `avatar_url`

### 問題 2: 每次都被當新會話
**原因**: `session_id` 沒有正確回存
**解決**: 檢查前端是否正確保存和傳送 `session_id`

### 問題 3: 後台列表看不到用戶資料
**原因**: 查詢沒有 JOIN `user_profiles`
**解決**: 更新後台查詢語句，加入 JOIN 語法

### 問題 4: 匿名用戶無法追蹤
**原因**: 沒有使用 `external_id` 串聯
**解決**: 確保使用 cookie 或 deviceId 作為 `external_id`

## 📊 監控指標

- **用戶資料完整率**: 有 `display_name` 的會話比例
- **會話連續性**: 同 `external_id` 的會話是否正確串聯
- **資料一致性**: 後台顯示的用戶資料與前台輸入是否一致

## 🎉 預期效果

實施完成後，後台對話歷史管理將能夠：
- 顯示每個會話的用戶暱稱和頭像
- 正確追蹤匿名用戶的對話歷史
- 支援跨裝置的用戶識別
- 提供完整的對話上下文

---

**實施完成後，請執行驗收測試並回報結果！** 🚀
