#!/bin/bash
# 高文文聊天 API 測試腳本
# 測試前台送訊息功能：user_meta、session_id、後台顯示

echo "🧪 高文文聊天 API 測試開始..."
echo "================================================"

# 設定測試參數
API_URL="http://localhost:3000/api/chat/message"
EXTERNAL_ID="client_test_$(date +%s)"
DISPLAY_NAME="兔貝比"
AVATAR_URL="https://example.com/avatar.png"

echo "📋 測試參數："
echo "  - API URL: $API_URL"
echo "  - External ID: $EXTERNAL_ID"
echo "  - Display Name: $DISPLAY_NAME"
echo "  - Avatar URL: $AVATAR_URL"
echo ""

# 測試 1: 第一句（建立新會話）
echo "🔍 測試 1: 發送第一句訊息（建立新會話）"
echo "----------------------------------------"

RESPONSE1=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 11111111-1111-4111-8111-111111111111" \
  -d "{
    \"session_id\": null,
    \"message\": { \"role\": \"user\", \"content\": \"哈囉，高文文！我想問停車。\" },
    \"user_meta\": {
      \"external_id\": \"$EXTERNAL_ID\",
      \"display_name\": \"$DISPLAY_NAME\",
      \"avatar_url\": \"$AVATAR_URL\"
    },
    \"context\": { \"client_ip\": \"127.0.0.1\", \"user_agent\": \"curl-test\" }
  }")

echo "📤 請求內容："
echo "  - session_id: null (新會話)"
echo "  - message: 哈囉，高文文！我想問停車。"
echo "  - user_meta: $DISPLAY_NAME, $AVATAR_URL"
echo ""

echo "📥 回應內容："
echo "$RESPONSE1" | jq '.' 2>/dev/null || echo "$RESPONSE1"
echo ""

# 提取 session_id
SESSION_ID=$(echo "$RESPONSE1" | jq -r '.session_id' 2>/dev/null)

if [ "$SESSION_ID" = "null" ] || [ -z "$SESSION_ID" ]; then
  echo "❌ 錯誤：無法獲取 session_id"
  echo "請檢查 API 是否正常運作"
  exit 1
fi

echo "✅ 成功獲取 session_id: $SESSION_ID"
echo ""

# 測試 2: 第二句（沿用同一會話）
echo "🔍 測試 2: 發送第二句訊息（沿用同一會話）"
echo "----------------------------------------"

RESPONSE2=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 22222222-2222-4222-8222-222222222222" \
  -d "{
    \"session_id\": \"$SESSION_ID\",
    \"message\": { \"role\": \"user\", \"content\": \"可以幫我推薦附近停車場嗎？\" },
    \"user_meta\": {
      \"external_id\": \"$EXTERNAL_ID\",
      \"display_name\": \"$DISPLAY_NAME\",
      \"avatar_url\": \"$AVATAR_URL\"
    },
    \"context\": { \"client_ip\": \"127.0.0.1\", \"user_agent\": \"curl-test\" }
  }")

echo "📤 請求內容："
echo "  - session_id: $SESSION_ID (沿用會話)"
echo "  - message: 可以幫我推薦附近停車場嗎？"
echo "  - user_meta: $DISPLAY_NAME, $AVATAR_URL"
echo ""

echo "📥 回應內容："
echo "$RESPONSE2" | jq '.' 2>/dev/null || echo "$RESPONSE2"
echo ""

# 測試 3: 第三句（確認會話延續）
echo "🔍 測試 3: 發送第三句訊息（確認會話延續）"
echo "----------------------------------------"

RESPONSE3=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 33333333-3333-4333-8333-333333333333" \
  -d "{
    \"session_id\": \"$SESSION_ID\",
    \"message\": { \"role\": \"user\", \"content\": \"謝謝你的推薦！\" },
    \"user_meta\": {
      \"external_id\": \"$EXTERNAL_ID\",
      \"display_name\": \"$DISPLAY_NAME\",
      \"avatar_url\": \"$AVATAR_URL\"
    },
    \"context\": { \"client_ip\": \"127.0.0.1\", \"user_agent\": \"curl-test\" }
  }")

echo "📤 請求內容："
echo "  - session_id: $SESSION_ID (沿用會話)"
echo "  - message: 謝謝你的推薦！"
echo "  - user_meta: $DISPLAY_NAME, $AVATAR_URL"
echo ""

echo "📥 回應內容："
echo "$RESPONSE3" | jq '.' 2>/dev/null || echo "$RESPONSE3"
echo ""

# 測試結果總結
echo "📊 測試結果總結"
echo "================================================"
echo "✅ 第一句：建立新會話 - $SESSION_ID"
echo "✅ 第二句：沿用會話 - $SESSION_ID"
echo "✅ 第三句：沿用會話 - $SESSION_ID"
echo ""

echo "🎯 驗收檢查點："
echo "1. 後台「對話列表」應出現：$DISPLAY_NAME + 頭像 + 最後一句預覽"
echo "2. 「對話詳情」這個會話應有 3 條用戶訊息 + 3 條 AI 回覆"
echo "3. 用戶資料應正確顯示：暱稱、頭像、external_id"
echo ""

echo "🔍 後端自查清單："
echo "- [ ] 每次 API 有收到 user_meta.display_name / avatar_url / external_id"
echo "- [ ] 第一句時有建立 UserProfile（upsert by external_id）與 ChatSession"
echo "- [ ] 回傳的 session_id 是否被前端保存並沿用"
echo "- [ ] 列表查詢是否 JOIN UserProfile 顯示暱稱/頭像"
echo "- [ ] ChatSession.last_message_preview 有更新"
echo ""

echo "🎉 測試完成！請檢查後台對話歷史管理頁面"
echo "如果看到「unknown-client」，請檢查上述自查清單"
