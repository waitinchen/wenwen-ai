/**
 * 全面場景測試 - 測試高文文可能被問到的所有場景
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const testHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY
};

async function testScenario(message, expectedIntent, testName) {
  console.log(`\n=== ${testName} ===`);
  console.log(`測試訊息: "${message}"`);
  console.log(`預期意圖: ${expectedIntent}`);
  
  const url = `${SUPABASE_URL}/functions/v1/claude-chat`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: testHeaders,
      body: JSON.stringify({
        session_id: `comprehensive-test-${Date.now()}`,
        message: { 
          role: 'user', 
          content: message 
        },
        user_meta: { 
          external_id: 'comprehensive-test',
          display_name: '全面測試用戶'
        }
      })
    });

    console.log(`HTTP 狀態: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ 請求失敗: ${errorText}`);
      return { passed: false, actualIntent: null, response: null };
    }

    const result = await response.json();
    const data = result.data;
    
    console.log('✅ 請求成功');
    console.log('版本:', data.version);
    console.log('實際意圖:', data.intent);
    console.log('信心度:', data.confidence);
    console.log('推薦商家數量:', data.recommended_stores?.length || 0);
    
    // 檢查意圖是否正確
    const intentCorrect = data.intent === expectedIntent;
    console.log(intentCorrect ? '✅ 意圖識別正確' : '❌ 意圖識別錯誤');
    
    // 顯示回應摘要
    console.log('AI 回應摘要:', data.response.substring(0, 100) + '...');
    
    return { 
      passed: intentCorrect, 
      actualIntent: data.intent, 
      response: data.response,
      storeCount: data.recommended_stores?.length || 0
    };
    
  } catch (error) {
    console.log(`❌ 測試異常: ${error.message}`);
    return { passed: false, actualIntent: null, response: null };
  }
}

async function runComprehensiveTests() {
  console.log('🔍 全面場景測試 - 高文文可能被問到的所有場景');
  console.log('=====================================================');
  
  const testScenarios = [
    // 美食相關場景
    { message: '有日料嗎?', expectedIntent: 'FOOD', testName: '日料查詢' },
    { message: '想吃壽司', expectedIntent: 'FOOD', testName: '壽司查詢' },
    { message: '推薦韓式料理', expectedIntent: 'FOOD', testName: '韓式料理查詢' },
    { message: '有泰式餐廳嗎?', expectedIntent: 'FOOD', testName: '泰式餐廳查詢' },
    { message: '想吃義大利麵', expectedIntent: 'FOOD', testName: '義式料理查詢' },
    { message: '有素食餐廳嗎?', expectedIntent: 'FOOD', testName: '素食餐廳查詢' },
    { message: '早餐推薦', expectedIntent: 'FOOD', testName: '早餐推薦' },
    { message: '午餐吃什麼?', expectedIntent: 'FOOD', testName: '午餐推薦' },
    { message: '有宵夜嗎?', expectedIntent: 'FOOD', testName: '宵夜推薦' },
    { message: '推薦一些美食', expectedIntent: 'FOOD', testName: '一般美食推薦' },
    
    // 生活服務場景
    { message: '哪裡買衣服?', expectedIntent: 'SHOPPING', testName: '購物查詢' },
    { message: '有美髮店嗎?', expectedIntent: 'BEAUTY', testName: '美髮查詢' },
    { message: '哪裡剪頭髮?', expectedIntent: 'BEAUTY', testName: '剪髮查詢' },
    { message: '有美容院嗎?', expectedIntent: 'BEAUTY', testName: '美容查詢' },
    { message: '有診所嗎?', expectedIntent: 'MEDICAL', testName: '診所查詢' },
    { message: '哪裡買藥?', expectedIntent: 'MEDICAL', testName: '藥局查詢' },
    
    // 交通停車場景
    { message: '哪裡可以停車?', expectedIntent: 'PARKING', testName: '停車查詢' },
    { message: '有停車場嗎?', expectedIntent: 'PARKING', testName: '停車場查詢' },
    { message: '停車費多少?', expectedIntent: 'PARKING', testName: '停車費查詢' },
    
    // 英語學習場景
    { message: '有英語補習班嗎?', expectedIntent: 'ENGLISH_LEARNING', testName: '英語補習班查詢' },
    { message: '哪裡學英文?', expectedIntent: 'ENGLISH_LEARNING', testName: '英文學習查詢' },
    { message: '我想學美語', expectedIntent: 'ENGLISH_LEARNING', testName: '美語學習查詢' },
    
    // 統計查詢場景
    { message: '你的資料庫有多少商家?', expectedIntent: 'STATISTICS', testName: '商家統計查詢' },
    { message: '有多少餐廳?', expectedIntent: 'STATISTICS', testName: '餐廳統計查詢' },
    
    // 確認回應場景
    { message: '好', expectedIntent: 'CONFIRMATION', testName: '簡單確認' },
    { message: '謝謝', expectedIntent: 'CONFIRMATION', testName: '感謝確認' },
    { message: '了解', expectedIntent: 'CONFIRMATION', testName: '了解確認' },
    
    // 一般推薦場景
    { message: '文山特區有什麼?', expectedIntent: 'GENERAL', testName: '區域介紹' },
    { message: '這裡有什麼好玩的?', expectedIntent: 'GENERAL', testName: '娛樂推薦' }
  ];
  
  let passedTests = 0;
  let totalTests = testScenarios.length;
  const results = [];
  
  for (const scenario of testScenarios) {
    const result = await testScenario(
      scenario.message,
      scenario.expectedIntent,
      scenario.testName
    );
    
    results.push({
      ...scenario,
      ...result
    });
    
    if (result.passed) {
      passedTests++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n=====================================================');
  console.log('🏁 全面場景測試完成');
  console.log(`通過: ${passedTests}/${totalTests}`);
  console.log(`成功率: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  // 顯示失敗的測試
  const failedTests = results.filter(r => !r.passed);
  if (failedTests.length > 0) {
    console.log('\n❌ 失敗的測試:');
    failedTests.forEach(test => {
      console.log(`- ${test.testName}: 預期 ${test.expectedIntent}, 實際 ${test.actualIntent}`);
    });
  }
  
  // 顯示成功的美食推薦測試
  const foodTests = results.filter(r => r.expectedIntent === 'FOOD' && r.passed);
  console.log('\n🍽️ 美食推薦測試結果:');
  foodTests.forEach(test => {
    console.log(`- ${test.testName}: ${test.storeCount} 個推薦`);
  });
  
  return results;
}

// 執行測試
runComprehensiveTests().catch(error => {
  console.error('測試執行失敗:', error);
  process.exit(1);
});
