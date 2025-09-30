/**
 * 檢查 Supabase Edge Function 環境變數配置
 */

console.log('🔍 檢查 Supabase Edge Function 環境變數配置\n');

// 必要的環境變數清單
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY', 
  'SERVICE_ROLE_KEY',
  'CLAUDE_API_KEY'
];

// 可選的環境變數
const optionalEnvVars = [
  'CLAUDE_MODEL'
];

console.log('📋 必要環境變數：');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: 已設置 (${value.substring(0, 10)}...)`);
  } else {
    console.log(`❌ ${envVar}: 未設置`);
  }
});

console.log('\n📋 可選環境變數：');
optionalEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${value}`);
  } else {
    console.log(`⚠️ ${envVar}: 未設置 (將使用預設值)`);
  }
});

console.log('\n📝 部署前檢查清單：');
console.log('1. ✅ 確保所有必要環境變數已設置');
console.log('2. ✅ 確認 SUPABASE_URL 格式正確 (https://xxx.supabase.co)');
console.log('3. ✅ 確認 SERVICE_ROLE_KEY 具有完整資料庫權限');
console.log('4. ✅ 確認 CLAUDE_API_KEY 有效且有足夠配額');
console.log('5. ✅ 確認資料庫表結構完整 (stores, user_profiles, chat_sessions, chat_messages)');

console.log('\n🚀 部署指令：');
console.log('1. 前往 Supabase Dashboard > Edge Functions');
console.log('2. 創建新函數 "wen-v2"');
console.log('3. 複製 scripts/wen-v2-deploy.ts 的內容');
console.log('4. 貼上到編輯器中並點擊 Deploy');
console.log('5. 測試函數是否正常運行');

console.log('\n🧪 測試指令：');
console.log('curl -X POST https://your-project.supabase.co/functions/v1/wen-v2 \\');
console.log('  -H "Authorization: Bearer your-anon-key" \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"session_id":"test","message":{"role":"user","content":"有什麼美食推薦？"},"user_meta":{"external_id":"test","display_name":"測試用戶"}}\'');
