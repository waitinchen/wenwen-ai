// 自動診斷 admin 問題
console.log('🔍 自動診斷 admin 問題');
console.log('============================================================');

// 檢查環境變數
function checkEnvironmentVariables() {
  console.log('📝 檢查環境變數:');
  console.log('============================================================');
  
  console.log('需要檢查的環境變數:');
  console.log('1. SUPABASE_SERVICE_ROLE_KEY');
  console.log('2. SUPABASE_URL');
  console.log('3. 這些變數應該在 Supabase Dashboard 的 Edge Functions 設定中');
  
  console.log('\n檢查步驟:');
  console.log('1. 前往 https://supabase.com/dashboard');
  console.log('2. 進入您的專案');
  console.log('3. 左側選單 → Edge Functions');
  console.log('4. 找到 admin-management 函數');
  console.log('5. 點擊函數名稱進入詳細頁面');
  console.log('6. 查看 "Environment Variables" 部分');
  console.log('7. 確認是否有 SUPABASE_SERVICE_ROLE_KEY 和 SUPABASE_URL');
}

// 檢查資料庫表結構
function checkDatabaseStructure() {
  console.log('\n📝 檢查資料庫表結構:');
  console.log('============================================================');
  
  console.log('需要檢查的資料庫表:');
  console.log('1. quick_questions 表');
  console.log('2. admin_sessions 表');
  console.log('3. admins 表');
  
  console.log('\n檢查步驟:');
  console.log('1. 前往 https://supabase.com/dashboard');
  console.log('2. 進入您的專案');
  console.log('3. 左側選單 → Table Editor');
  console.log('4. 查看是否有 quick_questions 表');
  console.log('5. 查看是否有 admin_sessions 表');
  console.log('6. 查看是否有 admins 表');
  
  console.log('\n預期的表結構:');
  console.log('quick_questions:');
  console.log('  - id (primary key)');
  console.log('  - question (text)');
  console.log('  - display_order (integer)');
  console.log('  - is_enabled (boolean)');
  console.log('  - created_at (timestamp)');
  console.log('  - updated_at (timestamp)');
}

// 檢查 Edge Function 日誌
function checkEdgeFunctionLogs() {
  console.log('\n📝 檢查 Edge Function 日誌:');
  console.log('============================================================');
  
  console.log('檢查步驟:');
  console.log('1. 前往 https://supabase.com/dashboard');
  console.log('2. 進入您的專案');
  console.log('3. 左側選單 → Edge Functions');
  console.log('4. 找到 admin-management 函數');
  console.log('5. 點擊函數名稱進入詳細頁面');
  console.log('6. 查看 "Logs" 標籤');
  console.log('7. 尋找最近的錯誤訊息');
  
  console.log('\n常見錯誤訊息:');
  console.log('1. "Supabase配置缺失" - 環境變數問題');
  console.log('2. "Authentication failed" - 認證問題');
  console.log('3. "Query quick_questions failed" - 資料庫問題');
  console.log('4. "Permission denied" - 權限問題');
}

// 檢查 Service Role Key 權限
function checkServiceRolePermissions() {
  console.log('\n📝 檢查 Service Role Key 權限:');
  console.log('============================================================');
  
  console.log('檢查步驟:');
  console.log('1. 前往 https://supabase.com/dashboard');
  console.log('2. 進入您的專案');
  console.log('3. 左側選單 → Settings → API');
  console.log('4. 查看 "Project API keys" 部分');
  console.log('5. 確認 "service_role" key 存在');
  console.log('6. 複製 service_role key');
  
  console.log('\n權限檢查:');
  console.log('1. Service Role Key 應該有完整的資料庫存取權限');
  console.log('2. 可以讀寫所有表');
  console.log('3. 可以執行所有 SQL 操作');
}

// 提供修復建議
function provideFixSuggestions() {
  console.log('\n📝 修復建議:');
  console.log('============================================================');
  
  console.log('如果環境變數問題:');
  console.log('1. 在 Edge Functions 設定中添加環境變數');
  console.log('2. SUPABASE_SERVICE_ROLE_KEY = 您的 service_role key');
  console.log('3. SUPABASE_URL = 您的 Supabase 專案 URL');
  console.log('4. 重新部署 Edge Functions');
  
  console.log('\n如果資料庫表問題:');
  console.log('1. 創建缺失的表');
  console.log('2. 使用 SQL Editor 執行建表語句');
  console.log('3. 確認表結構正確');
  
  console.log('\n如果權限問題:');
  console.log('1. 確認 Service Role Key 正確');
  console.log('2. 檢查 RLS (Row Level Security) 設定');
  console.log('3. 確認 Service Role 有 bypass RLS 權限');
}

// 創建測試腳本
function createTestScript() {
  console.log('\n📝 創建測試腳本:');
  console.log('============================================================');
  
  const testScript = `
// 測試 Edge Function 連線
async function testEdgeFunction() {
  const baseUrl = 'YOUR_SUPABASE_URL';
  const token = 'YOUR_ADMIN_TOKEN';
  
  try {
    // 測試認證
    const authResponse = await fetch(\`\${baseUrl}/functions/v1/admin-auth\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', token })
    });
    
    console.log('認證測試:', authResponse.status);
    
    if (authResponse.ok) {
      // 測試管理功能
      const mgmtResponse = await fetch(\`\${baseUrl}/functions/v1/admin-management\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list',
          table: 'quick_questions',
          token
        })
      });
      
      console.log('管理功能測試:', mgmtResponse.status);
      const result = await mgmtResponse.text();
      console.log('回應:', result);
    }
    
  } catch (error) {
    console.error('測試失敗:', error);
  }
}
`;
  
  console.log('測試腳本已準備好，請替換 YOUR_SUPABASE_URL 和 YOUR_ADMIN_TOKEN');
}

// 執行診斷
checkEnvironmentVariables();
checkDatabaseStructure();
checkEdgeFunctionLogs();
checkServiceRolePermissions();
provideFixSuggestions();
createTestScript();

console.log('\n============================================================');
console.log('🎯 請按照上述步驟檢查並告訴我結果：');
console.log('1. 環境變數是否存在且正確？');
console.log('2. 資料庫表是否存在？');
console.log('3. Edge Function 日誌顯示什麼錯誤？');
console.log('4. Service Role Key 是否正確？');
console.log('============================================================');
