// 深入診斷 admin 編輯問題
console.log('🔍 深入診斷 admin 編輯問題');
console.log('============================================================');

console.log('📝 問題確認:');
console.log('============================================================');
console.log('✅ 已修復 CORS 問題');
console.log('✅ 已清除記住密碼功能');
console.log('✅ 已重新登入');
console.log('❌ 仍然無法編輯快速問題');

console.log('\n📝 深入診斷步驟:');
console.log('============================================================');

console.log('1. 檢查 Edge Function 部署狀態:');
console.log('   - 確認 admin-management 已重新部署');
console.log('   - 確認 admin-auth 已重新部署');
console.log('   - 檢查 Edge Function 日誌');

console.log('\n2. 檢查環境變數:');
console.log('   - SUPABASE_SERVICE_ROLE_KEY');
console.log('   - SUPABASE_URL');
console.log('   - 確認變數值正確');

console.log('\n3. 檢查資料庫權限:');
console.log('   - 確認 Service Role Key 有寫入權限');
console.log('   - 確認 quick_questions 表存在');
console.log('   - 確認表結構正確');

console.log('\n4. 檢查前端 API 調用:');
console.log('   - 檢查 updateQuickQuestion 函數');
console.log('   - 檢查請求格式');
console.log('   - 檢查錯誤處理');

console.log('\n📝 可能的根本原因:');
console.log('============================================================');

console.log('原因 1: Edge Function 環境變數問題');
console.log('   - SUPABASE_SERVICE_ROLE_KEY 未設定或錯誤');
console.log('   - SUPABASE_URL 未設定或錯誤');
console.log('   - 導致 Edge Function 無法連接資料庫');

console.log('\n原因 2: 資料庫權限問題');
console.log('   - Service Role Key 沒有寫入 quick_questions 表的權限');
console.log('   - 表不存在或結構不正確');
console.log('   - 外鍵約束問題');

console.log('\n原因 3: 前端 API 調用問題');
console.log('   - updateQuickQuestion 函數邏輯錯誤');
console.log('   - 請求格式不正確');
console.log('   - 錯誤處理掩蓋了真實錯誤');

console.log('\n原因 4: 認證流程問題');
console.log('   - token 驗證邏輯錯誤');
console.log('   - 會話管理問題');
console.log('   - admin_sessions 表問題');

console.log('\n📝 診斷檢查清單:');
console.log('============================================================');

console.log('□ 檢查 Supabase Dashboard Edge Functions 頁面');
console.log('   - 確認 admin-management 狀態為 "Deployed"');
console.log('   - 確認 admin-auth 狀態為 "Deployed"');

console.log('\n□ 檢查 Edge Function 環境變數:');
console.log('   - 進入 Edge Functions 設定');
console.log('   - 確認 SUPABASE_SERVICE_ROLE_KEY 存在且正確');
console.log('   - 確認 SUPABASE_URL 存在且正確');

console.log('\n□ 檢查 Edge Function 日誌:');
console.log('   - 查看 admin-management 日誌');
console.log('   - 查看 admin-auth 日誌');
console.log('   - 尋找錯誤訊息');

console.log('\n□ 檢查資料庫:');
console.log('   - 確認 quick_questions 表存在');
console.log('   - 確認表結構正確');
console.log('   - 確認有測試資料');

console.log('\n□ 檢查瀏覽器開發者工具:');
console.log('   - Network 標籤中的請求狀態碼');
console.log('   - Console 標籤中的錯誤訊息');
console.log('   - 請求和回應的詳細內容');

console.log('\n📝 緊急修復建議:');
console.log('============================================================');

console.log('1. 檢查 Edge Function 日誌 (最重要)');
console.log('   - 這會告訴我們確切的錯誤原因');

console.log('\n2. 檢查環境變數設定');
console.log('   - 確認 SUPABASE_SERVICE_ROLE_KEY 正確');
console.log('   - 確認 SUPABASE_URL 正確');

console.log('\n3. 測試 Edge Function 直接調用');
console.log('   - 使用 Postman 或 curl 測試');
console.log('   - 確認 Edge Function 本身是否正常');

console.log('\n4. 檢查資料庫連線');
console.log('   - 確認 Service Role Key 可以連接到資料庫');
console.log('   - 確認可以讀寫 quick_questions 表');

console.log('\n============================================================');
console.log('🎯 請優先檢查 Edge Function 日誌！');
console.log('這會告訴我們確切的錯誤原因和解決方案。');
console.log('============================================================');
