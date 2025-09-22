# 高文文聊天 API 測試指南

## 📋 測試目標

驗證前台送訊息功能是否正確實施：
- ✅ `user_meta`（暱稱、頭像、external_id）有送到
- ✅ `session_id` 正確建立與沿用
- ✅ 後台列表能看到暱稱、頭像、最後一句摘要

## 🚀 測試方案

### 方案 A: curl 命令測試（最快）

#### Windows PowerShell
```powershell
npm run test:chat-api:win
```

#### Linux/macOS
```bash
npm run test:chat-api
```

#### 手動 curl 測試

**1. 第一句（建立新會話）**
```bash
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 11111111-1111-4111-8111-111111111111" \
  -d '{
    "session_id": null,
    "message": { "role": "user", "content": "哈囉，高文文！我想問停車。" },
    "user_meta": {
      "external_id": "client_abc123",
      "display_name": "兔貝比",
      "avatar_url": "https://example.com/avatar.png"
    },
    "context": { "client_ip": "127.0.0.1", "user_agent": "curl-test" }
  }'
```

**預期回應**：
```json
{ "ok": true, "session_id": "ck_XXXX..." }
```

**2. 第二句（沿用同一會話）**
```bash
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 22222222-2222-4222-8222-222222222222" \
  -d '{
    "session_id": "ck_XXXX...",
    "message": { "role": "user", "content": "可以幫我推薦附近停車場嗎？" },
    "user_meta": {
      "external_id": "client_abc123",
      "display_name": "兔貝比",
      "avatar_url": "https://example.com/avatar.png"
    },
    "context": { "client_ip": "127.0.0.1", "user_agent": "curl-test" }
  }'
```

### 方案 B: 前端測試頁面

1. 開啟瀏覽器訪問：`http://localhost:3000/test-chat.html`
2. 輸入暱稱和頭像 URL
3. 依序點擊三個按鈕發送訊息
4. 觀察測試日誌和後台顯示

## 🎯 驗收檢查點

### 前台測試
- [ ] 第一句訊息成功發送並建立新會話
- [ ] 第二句訊息成功發送並沿用同一會話
- [ ] 第三句訊息成功發送並沿用同一會話
- [ ] 每次請求都包含完整的 `user_meta` 資料

### 後台驗收
- [ ] 後台「對話列表」顯示用戶暱稱（兔貝比）
- [ ] 後台「對話列表」顯示用戶頭像
- [ ] 後台「對話列表」顯示最後一句預覽
- [ ] 後台「對話詳情」顯示完整的對話歷史
- [ ] 後台「對話詳情」顯示用戶資料資訊

## 🔍 後端自查清單

### API 接收檢查
- [ ] 每次 API 有收到 `user_meta.display_name`
- [ ] 每次 API 有收到 `user_meta.avatar_url`
- [ ] 每次 API 有收到 `user_meta.external_id`
- [ ] 每次 API 有收到 `context.client_ip` 和 `context.user_agent`

### 資料庫操作檢查
- [ ] 第一句時有建立 `UserProfile`（upsert by `external_id`）
- [ ] 第一句時有建立 `ChatSession`
- [ ] 回傳的 `session_id` 是否正確
- [ ] 後續訊息是否正確更新現有會話

### 查詢檢查
- [ ] 列表查詢是否 JOIN `UserProfile` 顯示暱稱/頭像
- [ ] `ChatSession.last_message_preview` 有更新
- [ ] 會話詳情查詢是否包含用戶資料

## ❌ 常見問題排除

### 問題 1: 後台顯示 "unknown-client"
**可能原因**：
1. 前端沒有送 `user_meta`
2. 後端 upsert 用錯 where 條件
3. 列表 API 沒 JOIN UserProfile

**檢查步驟**：
1. 檢查 API 請求是否包含 `user_meta` 欄位
2. 檢查後端 upsert 是否使用 `external_id` 作為 where 條件
3. 檢查後台查詢是否正確 JOIN `user_profiles` 表

### 問題 2: 每次都被當新會話
**可能原因**：
1. `session_id` 沒有正確回存
2. 前端沒有保存 `session_id`
3. 後端沒有正確處理 `session_id`

**檢查步驟**：
1. 檢查 API 回應是否包含 `session_id`
2. 檢查前端是否正確保存和傳送 `session_id`
3. 檢查後端是否正確處理現有會話

### 問題 3: 後台列表看不到用戶資料
**可能原因**：
1. 查詢沒有 JOIN `user_profiles`
2. 資料庫遷移沒有完成
3. 用戶資料沒有正確儲存

**檢查步驟**：
1. 檢查後台查詢語句是否包含 JOIN
2. 檢查資料庫是否有 `user_profiles` 表
3. 檢查 `user_profiles` 表是否有資料

## 📊 測試結果記錄

### 測試環境
- 日期：___________
- 測試者：___________
- 環境：___________

### 測試結果
- [ ] curl 測試通過
- [ ] 前端測試頁面通過
- [ ] 後台顯示正常
- [ ] 用戶資料完整

### 發現問題
- 問題描述：___________
- 解決方案：___________
- 狀態：___________

## 🎉 測試完成

當所有檢查點都通過時，表示前台對話完整保存功能已正確實施！

**下一步**：可以進行正式部署和用戶驗收測試。
