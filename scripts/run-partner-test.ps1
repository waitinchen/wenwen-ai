# 特約商家自動驗收腳本 (PowerShell 版本)
Write-Host "🤖 特約商家自動驗收腳本" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "正在執行自動驗收..." -ForegroundColor Yellow
Write-Host ""

# 執行自動驗收腳本
node scripts/auto-test-partner-stores.js

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "驗收完成！按任意鍵退出..." -ForegroundColor Cyan
Read-Host
