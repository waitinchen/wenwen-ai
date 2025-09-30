// 設定 Edge Function 環境變數
console.log('🔧 設定 Edge Function 環境變數');
console.log('============================================================');

console.log('📝 在新版 Supabase 中，環境變數設定方式已改變');
console.log('============================================================');

console.log('方法 1: 使用 Supabase CLI (推薦)');
console.log('============================================================');

console.log('1. 安裝 Supabase CLI:');
console.log('   npm install -g supabase');

console.log('\n2. 登入 Supabase:');
console.log('   supabase login');

console.log('\n3. 初始化專案 (如果尚未初始化):');
console.log('   supabase init');

console.log('\n4. 設定環境變數:');
console.log('   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sb_secret_FgIuCi_gWTgrLuobRdeyeA_xO1b4ecq');
console.log('   supabase secrets set SUPABASE_URL=https://vqcuwjfxoxjgsrueqodj.supabase.co');

console.log('\n5. 重新部署 Edge Functions:');
console.log('   supabase functions deploy admin-management');
console.log('   supabase functions deploy admin-auth');

console.log('\n方法 2: 檢查 Dashboard 其他位置');
console.log('============================================================');

console.log('1. 在 Edge Functions 頁面，查看是否有 "Settings" 按鈕');
console.log('2. 檢查是否有 "Environment" 或 "Secrets" 標籤');
console.log('3. 查看 "Code" 標籤中是否有環境變數設定');

console.log('\n方法 3: 直接在代碼中設定 (臨時解決方案)');
console.log('============================================================');

console.log('如果無法設定環境變數，可以臨時在代碼中硬編碼:');
console.log('1. 前往 Edge Functions → admin-management → Code 標籤');
console.log('2. 找到環境變數讀取的部分');
console.log('3. 臨時替換為實際值');

console.log('\n📝 環境變數值:');
console.log('============================================================');

console.log('SUPABASE_SERVICE_ROLE_KEY = sb_secret_FgIuCi_gWTgrLuobRdeyeA_xO1b4ecq');
console.log('SUPABASE_URL = https://vqcuwjfxoxjgsrueqodj.supabase.co');

console.log('\n📝 檢查步驟:');
console.log('============================================================');

console.log('1. 在 Edge Functions 頁面，查看所有標籤');
console.log('2. 尋找 "Settings", "Environment", "Secrets" 等選項');
console.log('3. 檢查是否有 "Configure" 或 "Settings" 按鈕');
console.log('4. 查看 "Code" 標籤中的代碼');

console.log('\n📝 如果找不到環境變數設定:');
console.log('============================================================');

console.log('1. 嘗試使用 Supabase CLI 方法');
console.log('2. 或者臨時在代碼中硬編碼環境變數');
console.log('3. 或者聯繫 Supabase 支援');

console.log('\n============================================================');
console.log('🎯 請先嘗試使用 Supabase CLI 方法！');
console.log('如果 CLI 不可用，請告訴我您看到了哪些選項。');
console.log('============================================================');
