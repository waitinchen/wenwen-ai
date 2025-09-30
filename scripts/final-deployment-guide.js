console.log('🚀 WEN 1.4.6 最終部署指南');
console.log('=====================================\n');

console.log('📋 部署前狀態檢查:');
console.log('✅ Edge Function: claude-chat (統計查詢修復)');
console.log('✅ 前端構建: dist/ 目錄 (版本號 WEN 1.4.6)');
console.log('✅ 管理後台: 認證已修復');
console.log('✅ 數據庫: 統計數據正確 (287個商家)');
console.log('✅ 管理員會話: 已創建 (admin-session-1759206353435)\n');

console.log('🎯 部署步驟:');
console.log('');
console.log('1️⃣ 部署 Edge Function (claude-chat)');
console.log('   📍 前往: https://supabase.com/dashboard');
console.log('   📍 進入: 您的專案 → Edge Functions → claude-chat');
console.log('   📍 複製: supabase/functions/claude-chat/index.ts 的全部內容');
console.log('   📍 貼上: 到 Supabase Dashboard 的 claude-chat 函數');
console.log('   📍 點擊: "Deploy" 或 "Redeploy"');
console.log('   📍 等待: 看到 "Deployed" 狀態\n');

console.log('2️⃣ 部署前端 (dist/ 目錄)');
console.log('   📍 上傳: dist/ 目錄的所有內容到您的服務器');
console.log('   📍 位置: /www/wwwroot/ai.linefans.cc/');
console.log('   📍 包含: index.html, _redirects, assets/, images/');
console.log('   📍 覆蓋: 所有舊文件\n');

console.log('3️⃣ 設置管理後台認證');
console.log('   📍 打開: 瀏覽器開發者工具 (F12)');
console.log('   📍 進入: Application → Local Storage');
console.log('   📍 設置: admin_token = "admin-session-1759206353435"');
console.log('   📍 刷新: 管理後台頁面\n');

console.log('4️⃣ 驗證部署結果');
console.log('   📍 測試: https://ai.linefans.cc/ (主頁)');
console.log('   📍 測試: https://ai.linefans.cc/admin (管理後台)');
console.log('   📍 測試: 統計查詢 "你的商家資料有多少資料?"');
console.log('   📍 檢查: 版本號顯示 WEN 1.4.6\n');

console.log('🔍 預期結果:');
console.log('✅ 統計查詢正確識別為 COVERAGE_STATS 意圖');
console.log('✅ 統計數據: 商家總數287, 安心店家23, 優惠店家18, 特約商家1, 分類數12');
console.log('✅ 管理後台顯示正確的商家統計數據');
console.log('✅ 版本號統一顯示 WEN 1.4.6');
console.log('✅ Admin 頁面不再 404\n');

console.log('🚨 如果遇到問題:');
console.log('1. Edge Function 部署失敗 → 檢查 Supabase 環境變數');
console.log('2. 前端 404 錯誤 → 檢查 _redirects 文件是否上傳');
console.log('3. 管理後台數據錯誤 → 檢查 admin_token 是否正確設置');
console.log('4. 統計查詢失敗 → 檢查 Edge Function 是否成功部署\n');

console.log('📞 需要幫助時:');
console.log('- 檢查瀏覽器 Console 錯誤訊息');
console.log('- 檢查 Supabase Dashboard 的 Edge Function 日誌');
console.log('- 確認所有文件都已正確上傳\n');

console.log('🎉 部署完成後，您的系統將具備:');
console.log('✨ 跨類別幻覺防護');
console.log('✨ 精準的統計查詢');
console.log('✨ 穩定的管理後台');
console.log('✨ 統一版本號管理');
console.log('✨ 完整的 SPA 路由支持\n');

console.log('準備好了嗎？開始部署吧！🚀');
