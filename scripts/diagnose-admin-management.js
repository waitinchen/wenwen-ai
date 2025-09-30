// 診斷 admin-management Edge Function 問題
console.log('🔍 診斷 admin-management Edge Function');
console.log('============================================================');

// 檢查 Edge Function 代碼中的潛在問題
function checkEdgeFunctionIssues() {
  console.log('📝 檢查 Edge Function 代碼問題:');
  console.log('============================================================');
  
  console.log('1. CORS Headers 問題:');
  console.log('   - 當前設定: Access-Control-Allow-Credentials: false');
  console.log('   - 建議: 移除 Access-Control-Allow-Credentials (與 * 衝突)');
  
  console.log('2. 認證邏輯問題:');
  console.log('   - verifyAdminAuth 函數可能無法正確驗證 token');
  console.log('   - 需要檢查 admin_sessions 和 admins 表是否存在');
  
  console.log('3. 環境變數問題:');
  console.log('   - 需要 SUPABASE_SERVICE_ROLE_KEY');
  console.log('   - 需要 SUPABASE_URL');
  
  console.log('4. 資料庫查詢問題:');
  console.log('   - 可能缺少必要的索引');
  console.log('   - 可能權限設定不正確');
}

// 檢查前端調用邏輯
function checkFrontendCallLogic() {
  console.log('\n📝 檢查前端調用邏輯:');
  console.log('============================================================');
  
  console.log('1. API 調用結構:');
  console.log('   - 是否正確傳遞 token 到 body 中?');
  console.log('   - 是否正確設定 Content-Type?');
  console.log('   - 是否正確處理錯誤回應?');
  
  console.log('2. 可能的問題:');
  console.log('   - token 格式不正確');
  console.log('   - 請求 body 結構錯誤');
  console.log('   - 錯誤處理邏輯有問題');
}

// 提供修復建議
function provideFixSuggestions() {
  console.log('\n💡 修復建議:');
  console.log('============================================================');
  
  console.log('1. 修復 CORS Headers:');
  console.log('   移除 Access-Control-Allow-Credentials: false');
  console.log('   因為與 Access-Control-Allow-Origin: * 衝突');
  
  console.log('2. 增強錯誤處理:');
  console.log('   在 Edge Function 中添加更詳細的錯誤日誌');
  console.log('   在前端添加更清楚的錯誤訊息');
  
  console.log('3. 檢查資料庫:');
  console.log('   確認所有必要的表都存在');
  console.log('   確認 Service Role Key 有正確權限');
  
  console.log('4. 測試認證流程:');
  console.log('   單獨測試 admin-auth Edge Function');
  console.log('   確認 token 生成和驗證都正常');
}

// 創建測試腳本
function createTestScript() {
  console.log('\n📝 創建測試腳本:');
  console.log('============================================================');
  
  const testScript = `
// 測試 admin-management Edge Function
async function testAdminManagement() {
  const baseUrl = 'YOUR_SUPABASE_URL';
  const token = 'YOUR_ADMIN_TOKEN';
  
  try {
    // 測試認證
    console.log('測試認證...');
    const authResponse = await fetch(\`\${baseUrl}/functions/v1/admin-auth\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', token })
    });
    
    if (!authResponse.ok) {
      console.error('認證失敗:', await authResponse.text());
      return;
    }
    
    // 測試獲取快速問題
    console.log('測試獲取快速問題...');
    const listResponse = await fetch(\`\${baseUrl}/functions/v1/admin-management\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'list',
        table: 'quick_questions',
        token
      })
    });
    
    console.log('狀態碼:', listResponse.status);
    const result = await listResponse.text();
    console.log('回應:', result);
    
  } catch (error) {
    console.error('測試失敗:', error);
  }
}
`;
  
  console.log('測試腳本已準備好，請替換 YOUR_SUPABASE_URL 和 YOUR_ADMIN_TOKEN');
}

// 執行診斷
checkEdgeFunctionIssues();
checkFrontendCallLogic();
provideFixSuggestions();
createTestScript();

console.log('\n============================================================');
console.log('🎯 下一步行動:');
console.log('1. 修復 CORS Headers 問題');
console.log('2. 檢查 Edge Function 日誌');
console.log('3. 測試認證流程');
console.log('4. 驗證資料庫表結構');
console.log('============================================================');
