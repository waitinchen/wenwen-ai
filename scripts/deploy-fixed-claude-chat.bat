@echo off
echo ========================================
echo 🔧 部署修復後的 Claude Chat 函數
echo ========================================

echo.
echo 📋 部署前檢查...
echo ✅ 檢查 claude-chat 函數文件...
if not exist "supabase\functions\claude-chat\index.ts" (
    echo ❌ 缺少 claude-chat 函數文件
    exit /b 1
) else (
    echo ✅ claude-chat 函數文件存在
)

echo.
echo 🔧 開始部署修復後的 Claude Chat 函數...

echo.
echo 📤 部署 Claude Chat（修復版）...
supabase functions deploy claude-chat --project-ref vqcuwjfxoxjgsrueqodj
if errorlevel 1 (
    echo ❌ claude-chat 部署失敗
    exit /b 1
)
echo ✅ claude-chat 部署成功

echo.
echo 🎉 修復後的 Claude Chat 函數部署完成！
echo ========================================
echo 📊 修復內容:
echo   - 修復會話記錄邏輯 ✅
echo   - 添加用戶元數據支持 ✅
echo   - 強化錯誤處理 ✅
echo   - 相容性查詢支持 ✅
echo ========================================

echo.
echo 🔗 函數端點:
echo   - Claude Chat: https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/claude-chat

echo.
echo 📋 後續步驟:
echo   1. 執行對話歷史測試腳本
echo   2. 在前台進行測試對話
echo   3. 檢查管理後台對話歷史顯示

pause