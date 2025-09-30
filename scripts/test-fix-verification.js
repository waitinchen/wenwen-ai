/**
 * 快速測試修正驗證
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const testHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY
};

async function testFix(message, expectedIntent, testName) {
  console.log(`\n=== ${testName} ===`);
  console.log(`測試訊息: "${message}"`);
  console.log(`預期意圖: ${expectedIntent}`);
  
  const url = `${SUPABASE_URL}/functions/v1/claude-chat`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: testHeaders,
      body: JSON.stringify({
        session_id: `fix-test-${Date.now()}`,
        message: { 
          role: 'user', 
          content: message 
        },
        user_meta: { 
          external_id: 'fix-test',
          display_name: '修正測試用戶'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ 請求失敗: ${errorText}`);
      return false;
    }

    const result = await response.json();
    const data = result.data;
    
    console.log('實際意圖:', data.intent);
    console.log('信心度:', data.confidence);
    
    const passed = data.intent === expectedIntent;
    console.log(passed ? '✅ 修正成功' : '❌ 修正失敗');
    
    return passed;
    
  } catch (error) {
    console.log(`❌ 測試異常: ${error.message}`);
    return false;
  }
}

async function runFixTests() {
  console.log('🔧 測試修正驗證');
  console.log('==================');
  
  const testCases = [
    { message: '有多少餐廳?', expectedIntent: 'STATISTICS', testName: '餐廳統計查詢修正' },
    { message: '這裡有什麼好玩的?', expectedIntent: 'GENERAL', testName: '娛樂推薦修正' },
    { message: '好', expectedIntent: 'CONFIRMATION', testName: '簡單確認保持' },
    { message: '謝謝', expectedIntent: 'CONFIRMATION', testName: '感謝確認保持' }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    const passed = await testFix(
      testCase.message,
      testCase.expectedIntent,
      testCase.testName
    );
    
    if (passed) {
      passedTests++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n==================');
  console.log('🏁 修正測試完成');
  console.log(`通過: ${passedTests}/${totalTests}`);
  console.log(`成功率: ${Math.round((passedTests / totalTests) * 100)}%`);
}

// 執行測試
runFixTests().catch(error => {
  console.error('測試執行失敗:', error);
  process.exit(1);
});
