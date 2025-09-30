/**
 * 測試不同的函數名稱
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const testHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY
};

async function testFunctionName(functionName) {
  console.log(`\n測試函數名稱: "${functionName}"`);
  
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;
  
  try {
    // 測試 OPTIONS 請求
    const optionsResponse = await fetch(url, {
      method: 'OPTIONS',
      headers: testHeaders
    });
    
    console.log(`OPTIONS 狀態: ${optionsResponse.status}`);
    
    if (optionsResponse.status === 200) {
      console.log('✅ 函數存在');
      
      // 測試 POST 請求
      const postResponse = await fetch(url, {
        method: 'POST',
        headers: testHeaders,
        body: JSON.stringify({
          session_id: 'test-session',
          message: { role: 'user', content: '測試' },
          user_meta: { external_id: 'test-user' }
        })
      });
      
      console.log(`POST 狀態: ${postResponse.status}`);
      
      if (postResponse.ok) {
        console.log('✅ POST 請求成功');
        return true;
      } else {
        const errorText = await postResponse.text();
        console.log(`❌ POST 失敗: ${errorText.substring(0, 100)}...`);
        return false;
      }
    } else {
      console.log('❌ 函數不存在');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ 測試失敗: ${error.message}`);
    return false;
  }
}

async function testAllFunctionNames() {
  console.log('🔍 測試不同的函數名稱');
  console.log('======================');
  
  const functionNames = [
    'allowlist-recommendation',
    'allowlist_recommendation',
    'allowlistrecommendation',
    'allowlist-recommendation-engine',
    'recommendation-engine',
    'smart-action',
    'claude-chat'
  ];
  
  const results = {};
  
  for (const name of functionNames) {
    results[name] = await testFunctionName(name);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n======================');
  console.log('📊 測試結果');
  console.log('======================');
  
  Object.entries(results).forEach(([name, success]) => {
    console.log(`${success ? '✅' : '❌'} ${name}`);
  });
  
  const workingFunctions = Object.entries(results).filter(([_, success]) => success);
  
  if (workingFunctions.length > 0) {
    console.log('\n💡 可用的函數:');
    workingFunctions.forEach(([name, _]) => {
      console.log(`  - ${name}`);
    });
  } else {
    console.log('\n⚠️ 沒有找到可用的函數');
  }
}

// 執行測試
testAllFunctionNames().catch(error => {
  console.error('測試執行失敗:', error);
  process.exit(1);
});
