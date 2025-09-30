/**
 * 測試現有的 smart-action Edge Function
 * 作為允許清單推薦引擎的後備方案
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUwNzUyNzIsImV4cCI6MjA1MDY1MTI3Mn0.2nQ8Y8Q8Y8Q8Y8Q8Y8Q8Y8Q8Y8Q8Y8Q8Y8Q8Y8Q8';

const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/smart-action`;

const testHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY
};

async function testSmartAction(message, testName) {
  console.log(`\n=== ${testName} ===`);
  console.log(`測試訊息: "${message}"`);
  
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: testHeaders,
      body: JSON.stringify({
        session_id: `test-session-${Date.now()}`,
        message: { 
          role: 'user', 
          content: message 
        },
        user_meta: { 
          external_id: 'test-user',
          display_name: '測試用戶'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ 回應成功');
    console.log('版本:', data.version);
    console.log('AI 回應:', data.response);
    
    if (data.recommended_stores && data.recommended_stores.length > 0) {
      console.log('推薦商家:');
      data.recommended_stores.forEach((store, index) => {
        console.log(`  ${index + 1}. ${store.name || store.store_name} (${store.category})`);
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    return false;
  }
}

async function runSmartActionTests() {
  console.log('🚀 開始 smart-action Edge Function 測試');
  console.log('=====================================');
  
  const testCases = [
    {
      message: '我想學英語',
      testName: '英語學習推薦測試'
    },
    {
      message: '推薦一些美食餐廳',
      testName: '美食推薦測試'
    },
    {
      message: '附近有停車場嗎？',
      testName: '停車場查詢測試'
    }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    const passed = await testSmartAction(
      testCase.message,
      testCase.testName
    );
    
    if (passed) {
      passedTests++;
    }
    
    // 等待一秒再進行下一個測試
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n=====================================');
  console.log('🏁 測試完成');
  console.log(`通過: ${passedTests}/${totalTests}`);
  console.log(`成功率: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 smart-action Edge Function 運作正常！');
    console.log('💡 建議：完成 allowlist-recommendation 部署後，前端將自動使用新的推薦引擎');
  } else {
    console.log('⚠️ smart-action 測試失敗，請檢查 Edge Function 設定');
  }
}

// 執行測試
runSmartActionTests().catch(error => {
  console.error('測試執行失敗:', error);
  process.exit(1);
});
