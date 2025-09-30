// 測試 admin/quick-questions 修改刪除問題
console.log('🔍 診斷 admin/quick-questions 問題');
console.log('============================================================');

// 模擬前端 API 調用
async function testQuickQuestionsAPI() {
  const baseUrl = 'https://your-project.supabase.co';
  const token = 'test-token'; // 假設的 admin token
  
  console.log('📝 測試: 檢查 admin-management Edge Function');
  
  try {
    // 測試 getQuickQuestions
    console.log('1. 測試獲取快速問題列表...');
    const listResponse = await fetch(`${baseUrl}/functions/v1/admin-management`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'list',
        table: 'quick_questions',
        token: token
      })
    });
    
    console.log('   狀態碼:', listResponse.status);
    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      console.log('   錯誤:', errorText);
    }
    
    // 測試 updateQuickQuestion
    console.log('2. 測試更新快速問題...');
    const updateResponse = await fetch(`${baseUrl}/functions/v1/admin-management`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'update',
        table: 'quick_questions',
        id: 1,
        data: {
          question: '測試問題',
          display_order: 1,
          is_enabled: true
        },
        token: token
      })
    });
    
    console.log('   狀態碼:', updateResponse.status);
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.log('   錯誤:', errorText);
    }
    
    // 測試 deleteQuickQuestion
    console.log('3. 測試刪除快速問題...');
    const deleteResponse = await fetch(`${baseUrl}/functions/v1/admin-management`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'delete',
        table: 'quick_questions',
        id: 1,
        token: token
      })
    });
    
    console.log('   狀態碼:', deleteResponse.status);
    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.log('   錯誤:', errorText);
    }
    
  } catch (error) {
    console.log('❌ 測試失敗:', error.message);
  }
}

// 檢查前端 API 調用邏輯
function checkFrontendAPILogic() {
  console.log('\n📝 檢查前端 API 調用邏輯');
  console.log('============================================================');
  
  console.log('🔍 檢查 src/lib/api.ts 中的問題:');
  console.log('1. updateQuickQuestion 函數:');
  console.log('   - 是否正確傳遞 token 到 Edge Function?');
  console.log('   - 是否處理 Edge Function 錯誤?');
  
  console.log('2. deleteQuickQuestion 函數:');
  console.log('   - 是否正確傳遞 token 到 Edge Function?');
  console.log('   - 是否處理 Edge Function 錯誤?');
  
  console.log('3. 可能的問題:');
  console.log('   - admin_token 不存在或過期');
  console.log('   - Edge Function 認證失敗');
  console.log('   - 資料庫權限問題');
  console.log('   - CORS 問題');
}

// 檢查 Edge Function 認證邏輯
function checkEdgeFunctionAuth() {
  console.log('\n📝 檢查 Edge Function 認證邏輯');
  console.log('============================================================');
  
  console.log('🔍 檢查 supabase/functions/admin-management/index.ts:');
  console.log('1. verifyAdminAuth 函數:');
  console.log('   - 是否正確查詢 admin_sessions 表?');
  console.log('   - 是否正確驗證 token 有效性?');
  console.log('   - 是否正確檢查過期時間?');
  
  console.log('2. 可能的問題:');
  console.log('   - admin_sessions 表不存在');
  console.log('   - admins 表不存在');
  console.log('   - 環境變數 SUPABASE_SERVICE_ROLE_KEY 未設定');
  console.log('   - 環境變數 SUPABASE_URL 未設定');
}

// 提供解決方案
function provideSolutions() {
  console.log('\n💡 解決方案');
  console.log('============================================================');
  
  console.log('1. 檢查環境變數:');
  console.log('   - 確認 SUPABASE_SERVICE_ROLE_KEY 已設定');
  console.log('   - 確認 SUPABASE_URL 已設定');
  
  console.log('2. 檢查資料庫表:');
  console.log('   - 確認 admin_sessions 表存在');
  console.log('   - 確認 admins 表存在');
  console.log('   - 確認 quick_questions 表存在');
  
  console.log('3. 檢查認證流程:');
  console.log('   - 確認 admin 已正確登入');
  console.log('   - 確認 admin_token 存在於 localStorage');
  console.log('   - 確認 token 未過期');
  
  console.log('4. 檢查 Edge Function 部署:');
  console.log('   - 確認 admin-management Edge Function 已部署');
  console.log('   - 確認 Edge Function 日誌無錯誤');
  
  console.log('5. 測試步驟:');
  console.log('   - 重新登入 admin 後台');
  console.log('   - 檢查瀏覽器開發者工具的 Network 標籤');
  console.log('   - 查看 Edge Function 日誌');
}

// 執行診斷
console.log('開始診斷...\n');

checkFrontendAPILogic();
checkEdgeFunctionAuth();
provideSolutions();

console.log('\n============================================================');
console.log('🎯 建議下一步:');
console.log('1. 檢查 Supabase Dashboard 中的 Edge Function 日誌');
console.log('2. 檢查瀏覽器開發者工具的 Network 標籤');
console.log('3. 確認 admin 登入狀態');
console.log('4. 檢查資料庫表結構');
console.log('============================================================');
