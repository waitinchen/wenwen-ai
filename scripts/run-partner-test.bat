@echo off
echo 🤖 特約商家自動驗收腳本
echo ================================
echo.
echo 正在執行自動驗收...
echo.

node scripts/auto-test-partner-stores.js

echo.
echo ================================
echo 驗收完成！按任意鍵退出...
pause > nul
