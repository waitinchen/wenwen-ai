@echo off
echo ========================================
echo 🚀 WEN 1.4.0 Edge Functions 部署腳本
echo ========================================

echo.
echo 📋 部署前檢查...
echo ✅ 檢查 response-script-management 函數...
if not exist "supabase\functions\response-script-management\index.ts" (
    echo ❌ 缺少 response-script-management 函數文件
    exit /b 1
) else (
    echo ✅ response-script-management 函數文件存在
)

echo ✅ 檢查 claude-chat-v3 函數...
if not exist "supabase\functions\claude-chat-v3\index.ts" (
    echo ❌ 缺少 claude-chat-v3 函數文件
    exit /b 1
) else (
    echo ✅ claude-chat-v3 函數文件存在
)

echo.
echo 🔧 開始部署 Edge Functions...

echo.
echo 📤 部署回應腳本管理API...
supabase functions deploy response-script-management --project-ref vqcuwjfxoxjgsrueqodj
if errorlevel 1 (
    echo ❌ response-script-management 部署失敗
    exit /b 1
)
echo ✅ response-script-management 部署成功

echo.
echo 📤 部署Claude Chat V3...
supabase functions deploy claude-chat-v3 --project-ref vqcuwjfxoxjgsrueqodj
if errorlevel 1 (
    echo ❌ claude-chat-v3 部署失敗
    exit /b 1
)
echo ✅ claude-chat-v3 部署成功

echo.
echo 🎉 所有 Edge Functions 部署完成！
echo ========================================
echo 📊 部署摘要:
echo   - response-script-management ✅
echo   - claude-chat-v3 ✅
echo ========================================

echo.
echo 🔗 函數端點:
echo   - Response Script Management: https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/response-script-management
echo   - Claude Chat V3: https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/claude-chat-v3

echo.
echo 📋 後續步驟:
echo   1. 執行部署後測試腳本
echo   2. 更新前端API端點配置
echo   3. 執行完整系統測試

pause