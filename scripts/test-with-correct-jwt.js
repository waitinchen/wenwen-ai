/**
 * 使用正確的 JWT 測試 Edge Functions
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const testHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY
};

async function testFunction(functionName, message, testName) {
  console.log(`\n=== ${testName} ===`);
  console.log(`測試函數: ${functionName}`);
  console.log(`測試訊息: "${message}"`);
  
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;
  
  try {
    const response = await fetch(url, {
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

    console.log(`HTTP 狀態: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ 請求失敗: ${errorText}`);
      return false;
    }

    const data = await response.json();
    console.log('✅ 請求成功');
    console.log('版本:', data.version);
    console.log('意圖:', data.intent);
    console.log('推薦商家數量:', data.recommended_stores?.length || 0);
    
    if (data.recommended_stores && data.recommended_stores.length > 0) {
      console.log('推薦商家:');
      data.recommended_stores.forEach((store, index) => {
        console.log(`  ${index + 1}. ${store.name || store.store_name} (${store.category})`);
        if (store.sponsorship_tier !== undefined) {
          console.log(`     贊助等級: ${store.sponsorship_tier}`);
        }
        if (store.evidence_level) {
          console.log(`     證據等級: ${store.evidence_level}`);
        }
        if (store.store_code) {
          console.log(`     店家代碼: ${store.store_code}`);
        }
      });
    }
    
    if (data.recommendation_logic) {
      console.log('推薦邏輯:');
      console.log(`  合格商家數量: ${data.recommendation_logic.eligible_count}`);
      console.log(`  最終推薦數量: ${data.recommendation_logic.final_count}`);
      console.log(`  肯塔基包含: ${data.recommendation_logic.kentucky_included ? '是' : '否'}`);
      console.log(`  證據驗證: ${data.recommendation_logic.evidence_verified ? '是' : '否'}`);
    }
    
    console.log('AI 回應:', data.response.substring(0, 150) + '...');
    
    return true;
    
  } catch (error) {
    console.log(`❌ 測試異常: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 使用正確 JWT 測試 Edge Functions');
  console.log('=====================================');
  
  const testCases = [
    {
      functionName: 'allowlist-recommendation',
      message: '我想學英語',
      testName: '允許清單推薦引擎 - 英語學習'
    },
    {
      functionName: 'smart-action',
      message: '我想學英語',
      testName: 'Smart Action - 英語學習'
    },
    {
      functionName: 'allowlist-recommendation',
      message: '推薦一些美食餐廳',
      testName: '允許清單推薦引擎 - 美食推薦'
    },
    {
      functionName: 'smart-action',
      message: '推薦一些美食餐廳',
      testName: 'Smart Action - 美食推薦'
    }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    const passed = await testFunction(
      testCase.functionName,
      testCase.message,
      testCase.testName
    );
    
    if (passed) {
      passedTests++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n=====================================');
  console.log('🏁 測試完成');
  console.log(`通過: ${passedTests}/${totalTests}`);
  console.log(`成功率: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests > 0) {
    console.log('🎉 至少有一個函數正常工作！');
  } else {
    console.log('⚠️ 所有函數測試失敗，請檢查部署狀態');
  }
}

// 執行測試
runTests().catch(error => {
  console.error('測試執行失敗:', error);
  process.exit(1);
});
