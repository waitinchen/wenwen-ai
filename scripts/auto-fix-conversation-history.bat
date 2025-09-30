@echo off
setlocal enabledelayedexpansion

echo ========================================
echo 🔧 對話歷史管理自動修復腳本
echo ========================================

echo.
echo 📋 步驟 1: 檢查環境...
echo ✅ 檢查必要文件...

if not exist "supabase\functions\claude-chat\index.ts" (
    echo ❌ 缺少 claude-chat 函數文件
    pause
    exit /b 1
)

if not exist "scripts\test-conversation-history-fix.js" (
    echo ❌ 缺少測試腳本文件
    pause
    exit /b 1
)

echo ✅ 所有必要文件都存在

echo.
echo 📋 步驟 2: 檢查 Supabase CLI...
supabase --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Supabase CLI 未安裝或未在 PATH 中
    echo 💡 請先安裝 Supabase CLI: npm install -g supabase
    echo 💡 然後使用 supabase login 登入
    pause
    exit /b 1
) else (
    echo ✅ Supabase CLI 已安裝
)

echo.
echo 📋 步驟 3: 檢查環境變數...
if "%SUPABASE_SERVICE_ROLE_KEY%"=="" (
    echo ❌ 缺少 SUPABASE_SERVICE_ROLE_KEY 環境變數
    echo.
    echo 💡 請設定環境變數：
    echo    set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    echo.
    set /p SERVICE_KEY="請輸入 Supabase Service Role Key: "
    if "!SERVICE_KEY!"=="" (
        echo ❌ 未輸入 Service Role Key
        pause
        exit /b 1
    )
    set SUPABASE_SERVICE_ROLE_KEY=!SERVICE_KEY!
    echo ✅ Service Role Key 已設定
) else (
    echo ✅ SUPABASE_SERVICE_ROLE_KEY 已設定
)

echo.
echo 📋 步驟 4: 部署修復後的 Claude Chat 函數...
echo 🚀 開始部署...
supabase functions deploy claude-chat --project-ref vqcuwjfxoxjgsrueqodj

if errorlevel 1 (
    echo ❌ Claude Chat 函數部署失敗
    echo 💡 請檢查：
    echo    1. 網路連接是否正常
    echo    2. 是否已使用 supabase login 登入
    echo    3. Project ID 是否正確
    pause
    exit /b 1
) else (
    echo ✅ Claude Chat 函數部署成功
)

echo.
echo 📋 步驟 5: 等待函數生效...
echo ⏱️  等待 5 秒讓函數完全生效...
timeout /t 5 /nobreak >nul

echo.
echo 📋 步驟 6: 執行修復效果測試...
echo 🧪 開始測試...

echo.
node scripts/test-conversation-history-fix.js

if errorlevel 1 (
    echo ❌ 測試執行失敗
    pause
    exit /b 1
) else (
    echo ✅ 測試執行完成
)

echo.
echo ========================================
echo 🎉 自動修復完成！
echo ========================================

echo.
echo 📋 後續驗證步驟：
echo   1. 打開管理後台: /admin/conversations
echo   2. 點擊「重新載入」按鈕
echo   3. 檢查是否能看到測試產生的對話記錄
echo   4. 在前台進行實際對話測試
echo   5. 回到管理後台確認新對話是否正確顯示

echo.
echo 🔗 相關連結：
echo   - 管理後台: http://localhost:3000/admin/conversations
echo   - Claude Chat API: https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/claude-chat

echo.
echo 💡 如果對話歷史仍未顯示，請檢查：
echo   1. 瀏覽器控制台是否有錯誤信息
echo   2. 管理後台的網路請求是否正常
echo   3. 數據庫權限設定是否正確

echo.
pause