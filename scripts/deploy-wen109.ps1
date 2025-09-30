# WEN 1.0.9 部署腳本
Write-Host "🚀 開始部署 WEN 1.0.9..." -ForegroundColor Green

# 1. 檢查必要文件
Write-Host "`n📋 檢查部署文件..." -ForegroundColor Yellow
if (Test-Path "scripts/index.ts") {
    Write-Host "✅ index.ts 存在" -ForegroundColor Green
} else {
    Write-Host "❌ index.ts 不存在" -ForegroundColor Red
    exit 1
}

# 2. 顯示部署指南
Write-Host "`n📖 部署步驟：" -ForegroundColor Cyan
Write-Host "1. 前往 Supabase Dashboard" -ForegroundColor White
Write-Host "2. 進入 Functions > claude-chat" -ForegroundColor White
Write-Host "3. 複製 scripts/index.ts 的內容" -ForegroundColor White
Write-Host "4. 貼上到編輯器中" -ForegroundColor White
Write-Host "5. 點擊 Deploy 按鈕" -ForegroundColor White

# 3. 環境變數檢查清單
Write-Host "`n🔧 環境變數檢查清單：" -ForegroundColor Cyan
Write-Host "✅ SUPABASE_URL" -ForegroundColor Green
Write-Host "✅ SUPABASE_ANON_KEY" -ForegroundColor Green
Write-Host "❓ SUPABASE_SERVICE_ROLE_KEY (需要新增)" -ForegroundColor Yellow
Write-Host "✅ CLAUDE_API_KEY" -ForegroundColor Green
Write-Host "❓ KENTUCKY_STORE_ID (可選)" -ForegroundColor Yellow

# 4. 獲取 Service Role Key 的指引
Write-Host "`n🔑 如何獲取 SUPABASE_SERVICE_ROLE_KEY：" -ForegroundColor Cyan
Write-Host "1. 前往: https://supabase.com/dashboard/project/vqcuwjfxoxjgsrueqodj/settings/api" -ForegroundColor White
Write-Host "2. 複製 'service_role' 密鑰" -ForegroundColor White
Write-Host "3. 在 Edge Functions 環境變數中設定" -ForegroundColor White

# 5. 測試腳本準備
Write-Host "`n🧪 部署後測試命令：" -ForegroundColor Cyan
Write-Host "npm run test:kentucky" -ForegroundColor White
Write-Host "node scripts/test-simple-conversation.js" -ForegroundColor White
Write-Host "npm run eval:partner" -ForegroundColor White

Write-Host "`n🎉 準備完成！請按照上述步驟進行部署。" -ForegroundColor Green
