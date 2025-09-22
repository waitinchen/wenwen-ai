# 高文文聊天 API 測試腳本 (PowerShell 版本)
# 測試前台送訊息功能：user_meta、session_id、後台顯示

Write-Host "🧪 高文文聊天 API 測試開始..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

# 設定測試參數
$API_URL = "http://localhost:3000/api/chat/message"
$EXTERNAL_ID = "client_test_$(Get-Date -Format 'yyyyMMddHHmmss')"
$DISPLAY_NAME = "兔貝比"
$AVATAR_URL = "https://example.com/avatar.png"

Write-Host "📋 測試參數：" -ForegroundColor Yellow
Write-Host "  - API URL: $API_URL" -ForegroundColor White
Write-Host "  - External ID: $EXTERNAL_ID" -ForegroundColor White
Write-Host "  - Display Name: $DISPLAY_NAME" -ForegroundColor White
Write-Host "  - Avatar URL: $AVATAR_URL" -ForegroundColor White
Write-Host ""

# 測試 1: 第一句（建立新會話）
Write-Host "🔍 測試 1: 發送第一句訊息（建立新會話）" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Cyan

$body1 = @{
    session_id = $null
    message = @{
        role = "user"
        content = "哈囉，高文文！我想問停車。"
    }
    user_meta = @{
        external_id = $EXTERNAL_ID
        display_name = $DISPLAY_NAME
        avatar_url = $AVATAR_URL
    }
    context = @{
        client_ip = "127.0.0.1"
        user_agent = "powershell-test"
    }
} | ConvertTo-Json -Depth 3

Write-Host "📤 請求內容：" -ForegroundColor Yellow
Write-Host "  - session_id: null (新會話)" -ForegroundColor White
Write-Host "  - message: 哈囉，高文文！我想問停車。" -ForegroundColor White
Write-Host "  - user_meta: $DISPLAY_NAME, $AVATAR_URL" -ForegroundColor White
Write-Host ""

try {
    $response1 = Invoke-RestMethod -Uri $API_URL -Method POST -Body $body1 -ContentType "application/json" -Headers @{
        "Idempotency-Key" = "11111111-1111-4111-8111-111111111111"
    }
    
    Write-Host "📥 回應內容：" -ForegroundColor Yellow
    $response1 | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor White
    Write-Host ""
    
    # 提取 session_id
    $SESSION_ID = $response1.session_id
    
    if (-not $SESSION_ID) {
        Write-Host "❌ 錯誤：無法獲取 session_id" -ForegroundColor Red
        Write-Host "請檢查 API 是否正常運作" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ 成功獲取 session_id: $SESSION_ID" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ 請求失敗: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 測試 2: 第二句（沿用同一會話）
Write-Host "🔍 測試 2: 發送第二句訊息（沿用同一會話）" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Cyan

$body2 = @{
    session_id = $SESSION_ID
    message = @{
        role = "user"
        content = "可以幫我推薦附近停車場嗎？"
    }
    user_meta = @{
        external_id = $EXTERNAL_ID
        display_name = $DISPLAY_NAME
        avatar_url = $AVATAR_URL
    }
    context = @{
        client_ip = "127.0.0.1"
        user_agent = "powershell-test"
    }
} | ConvertTo-Json -Depth 3

Write-Host "📤 請求內容：" -ForegroundColor Yellow
Write-Host "  - session_id: $SESSION_ID (沿用會話)" -ForegroundColor White
Write-Host "  - message: 可以幫我推薦附近停車場嗎？" -ForegroundColor White
Write-Host "  - user_meta: $DISPLAY_NAME, $AVATAR_URL" -ForegroundColor White
Write-Host ""

try {
    $response2 = Invoke-RestMethod -Uri $API_URL -Method POST -Body $body2 -ContentType "application/json" -Headers @{
        "Idempotency-Key" = "22222222-2222-4222-8222-222222222222"
    }
    
    Write-Host "📥 回應內容：" -ForegroundColor Yellow
    $response2 | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ 請求失敗: $($_.Exception.Message)" -ForegroundColor Red
}

# 測試結果總結
Write-Host "📊 測試結果總結" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ 第一句：建立新會話 - $SESSION_ID" -ForegroundColor White
Write-Host "✅ 第二句：沿用會話 - $SESSION_ID" -ForegroundColor White
Write-Host ""

Write-Host "🎯 驗收檢查點：" -ForegroundColor Yellow
Write-Host "1. 後台「對話列表」應出現：$DISPLAY_NAME + 頭像 + 最後一句預覽" -ForegroundColor White
Write-Host "2. 「對話詳情」這個會話應有 2 條用戶訊息 + 2 條 AI 回覆" -ForegroundColor White
Write-Host "3. 用戶資料應正確顯示：暱稱、頭像、external_id" -ForegroundColor White
Write-Host ""

Write-Host "🔍 後端自查清單：" -ForegroundColor Yellow
Write-Host "- [ ] 每次 API 有收到 user_meta.display_name / avatar_url / external_id" -ForegroundColor White
Write-Host "- [ ] 第一句時有建立 UserProfile（upsert by external_id）與 ChatSession" -ForegroundColor White
Write-Host "- [ ] 回傳的 session_id 是否被前端保存並沿用" -ForegroundColor White
Write-Host "- [ ] 列表查詢是否 JOIN UserProfile 顯示暱稱/頭像" -ForegroundColor White
Write-Host "- [ ] ChatSession.last_message_preview 有更新" -ForegroundColor White
Write-Host ""

Write-Host "🎉 測試完成！請檢查後台對話歷史管理頁面" -ForegroundColor Green
Write-Host "如果看到「unknown-client」，請檢查上述自查清單" -ForegroundColor Yellow
