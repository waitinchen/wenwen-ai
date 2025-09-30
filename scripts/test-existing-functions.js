/**
 * 測試現有 Edge Functions 的可用性
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUwNzUyNzIsImV4cCI6MjA1MDY1MTI3Mn0.2nQ8Y8Q8Y8Q8Y8Q8Y8Q8Y8Q8Y8Q8Y8Q8Y8Q8Y8Q8';

const testHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY
};

async function testFunction(functionName) {
  console.log(`\n=== 測試 ${functionName} ===`);
  
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;
  
  try {
    // 先測試 OPTIONS 請求
    console.log('測試 OPTIONS 請求...');
    const optionsResponse = await fetch(url, {
      method: 'OPTIONS',
      headers: testHeaders
    });
    
    console.log(`OPTIONS 狀態: ${optionsResponse.status}`);
    
    if (optionsResponse.status === 200) {
      console.log('✅ 函數存在且可訪問');
      
      // 測試 POST 請求
      console.log('測試 POST 請求...');
      const postResponse = await fetch(url, {
        method: 'POST',
        headers: testHeaders,
        body: JSON.stringify({
          session_id: 'test-session',
          message: { role: 'user', content: '測試訊息' },
          user_meta: { external_id: 'test-user' }
        })
      });
      
      console.log(`POST 狀態: ${postResponse.status}`);
      
      if (postResponse.ok) {
        const data = await postResponse.json();
        console.log('✅ POST 請求成功');
        console.log('回應版本:', data.version);
        return true;
      } else {
        const errorText = await postResponse.text();
        console.log(`❌ POST 請求失敗: ${errorText}`);
        return false;
      }
    } else {
      console.log('❌ 函數不存在或無法訪問');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ 測試失敗: ${error.message}`);
    return false;
  }
}

async function testAllFunctions() {
  console.log('🔍 測試所有 Edge Functions');
  console.log('============================');
  
  const functions = [
    'allowlist-recommendation',
    'smart-action',
    'claude-chat',
    'wen-v2',
    'admin-auth',
    'admin-management'
  ];
  
  const results = {};
  
  for (const func of functions) {
    results[func] = await testFunction(func);
    await new Promise(resolve => setTimeout(resolve, 500)); // 等待 0.5 秒
  }
  
  console.log('\n============================');
  console.log('📊 測試結果摘要');
  console.log('============================');
  
  Object.entries(results).forEach(([name, success]) => {
    console.log(`${success ? '✅' : '❌'} ${name}`);
  });
  
  const workingFunctions = Object.entries(results).filter(([_, success]) => success);
  console.log(`\n可用函數: ${workingFunctions.length}/${functions.length}`);
  
  if (workingFunctions.length > 0) {
    console.log('\n💡 建議使用的函數:');
    workingFunctions.forEach(([name, _]) => {
      console.log(`  - ${name}`);
    });
  }
}

// 執行測試
testAllFunctions().catch(error => {
  console.error('測試執行失敗:', error);
  process.exit(1);
});
