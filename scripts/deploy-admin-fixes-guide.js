// 部署 admin Edge Functions 修復指南
console.log('🚀 部署 admin Edge Functions 修復指南');
console.log('============================================================');

console.log('📝 已修復的問題:');
console.log('============================================================');
console.log('✅ CORS Headers 問題:');
console.log('   - 移除了 Access-Control-Allow-Credentials: false');
console.log('   - 解決了與 Access-Control-Allow-Origin: * 的衝突');
console.log('   - 影響: admin-management 和 admin-auth Edge Functions');

console.log('\n📝 部署步驟:');
console.log('============================================================');

console.log('1. 部署 admin-management Edge Function:');
console.log('   方法一（手動部署）:');
console.log('   - 開啟 Supabase Dashboard → https://supabase.com/dashboard');
console.log('   - 進入您的專案 → 選擇 "wenwen-ai" 專案');
console.log('   - 進入 Edge Functions 頁面 → 左側選單 → Edge Functions');
console.log('   - 找到 admin-management 函數 → 點擊 admin-management');
console.log('   - 點擊 "Deploy" 或 "Redeploy" 按鈕');
console.log('   - 等待部署完成 → 看到 "Deployed" 狀態');

console.log('\n   方法二（CLI 部署）:');
console.log('   npx supabase functions deploy admin-management');

console.log('\n2. 部署 admin-auth Edge Function:');
console.log('   方法一（手動部署）:');
console.log('   - 同樣在 Edge Functions 頁面');
console.log('   - 找到 admin-auth 函數 → 點擊 admin-auth');
console.log('   - 點擊 "Deploy" 或 "Redeploy" 按鈕');
console.log('   - 等待部署完成 → 看到 "Deployed" 狀態');

console.log('\n   方法二（CLI 部署）:');
console.log('   npx supabase functions deploy admin-auth');

console.log('\n3. 檢查環境變數:');
console.log('   - 確認 SUPABASE_SERVICE_ROLE_KEY 已設定');
console.log('   - 確認 SUPABASE_URL 已設定');
console.log('   - 這些變數在 Edge Functions 設定中');

console.log('\n📝 測試步驟:');
console.log('============================================================');

console.log('1. 測試 admin-auth Edge Function:');
console.log('   - 嘗試登入 admin 後台');
console.log('   - 確認登入成功');
console.log('   - 檢查 token 是否正確生成');

console.log('\n2. 測試 admin-management Edge Function:');
console.log('   - 登入後嘗試獲取快速問題列表');
console.log('   - 嘗試修改快速問題');
console.log('   - 嘗試刪除快速問題');
console.log('   - 確認操作成功');

console.log('\n3. 檢查瀏覽器開發者工具:');
console.log('   - 開啟 Network 標籤');
console.log('   - 執行修改/刪除操作');
console.log('   - 檢查請求狀態碼');
console.log('   - 確認沒有 CORS 錯誤');

console.log('\n📝 常見問題排除:');
console.log('============================================================');

console.log('1. 如果仍然無法修改/刪除:');
console.log('   - 檢查 admin_token 是否存在於 localStorage');
console.log('   - 確認 token 未過期');
console.log('   - 重新登入 admin 後台');

console.log('\n2. 如果出現 CORS 錯誤:');
console.log('   - 確認 Edge Functions 已重新部署');
console.log('   - 清除瀏覽器快取');
console.log('   - 重新整理頁面');

console.log('\n3. 如果出現認證錯誤:');
console.log('   - 檢查 Edge Function 日誌');
console.log('   - 確認環境變數設定正確');
console.log('   - 確認資料庫表存在');

console.log('\n📝 驗證修復效果:');
console.log('============================================================');

console.log('✅ 修復後應該能夠:');
console.log('   - 正常登入 admin 後台');
console.log('   - 獲取快速問題列表');
console.log('   - 修改快速問題內容');
console.log('   - 刪除快速問題');
console.log('   - 沒有 CORS 錯誤');

console.log('\n============================================================');
console.log('🎯 請按照上述步驟部署並測試！');
console.log('如果問題仍然存在，請檢查 Edge Function 日誌。');
console.log('============================================================');
