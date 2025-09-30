/**
 * 檢查 Supabase Dashboard 環境變數設置
 * 幫助診斷 JWT 認證問題
 */

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'CLAUDE_API_KEY',
  'CLAUDE_MODEL'
];

function checkEnvironmentVariables() {
  console.log('🔍 檢查 Supabase Dashboard 環境變數設置');
  console.log('==========================================');

  const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

  console.log('\n📋 當前已知的環境變數:');
  console.log(`✅ SUPABASE_URL: ${supabaseUrl}`);
  console.log(`✅ SUPABASE_ANON_KEY: ${supabaseAnonKey.substring(0, 20)}...`);

  console.log('\n⚠️ 需要在 Supabase Dashboard 中確認的環境變數:');
  console.log('==========================================');
  console.log('1. 前往 Supabase Dashboard');
  console.log('2. 選擇您的專案: vqcuwjfxoxjgsrueqodj');
  console.log('3. 點擊 "Edge Functions"');
  console.log('4. 選擇 "claude-chat" 函數');
  console.log('5. 點擊 "Settings" 標籤');
  console.log('6. 在 "Environment Variables" 區域確認以下變數:');

  requiredEnvVars.forEach((varName, index) => {
    const status = varName === 'SUPABASE_URL' || varName === 'SUPABASE_ANON_KEY' ? '✅' : '❓';
    console.log(`   ${index + 1}. ${status} ${varName}`);
  });

  console.log('\n🔧 建議的環境變數值:');
  console.log('==========================================');
  console.log('SUPABASE_URL=https://vqcuwjfxoxjgsrueqodj.supabase.co');
  console.log('SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo');
  console.log('SUPABASE_SERVICE_ROLE_KEY=[需要從 Supabase Dashboard > Settings > API 獲取]');
  console.log('CLAUDE_API_KEY=[您的 Claude API Key]');
  console.log('CLAUDE_MODEL=claude-3-5-sonnet-20241022');

  console.log('\n📝 獲取 SERVICE_ROLE_KEY 的步驟:');
  console.log('==========================================');
  console.log('1. 前往 Supabase Dashboard > Settings > API');
  console.log('2. 在 "Project API keys" 區域找到 "service_role" key');
  console.log('3. 複製該 key 並設置為 SUPABASE_SERVICE_ROLE_KEY');

  console.log('\n🚨 如果環境變數設置正確但仍出現 401 錯誤:');
  console.log('==========================================');
  console.log('1. 確認 Edge Function 已重新部署');
  console.log('2. 檢查 JWT 是否過期');
  console.log('3. 確認 API 端點 URL 正確');
  console.log('4. 檢查 CORS 設置');

  console.log('\n✅ 檢查完成！請按照上述步驟設置環境變數。');
}

// 執行檢查
checkEnvironmentVariables();
