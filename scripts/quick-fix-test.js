/**
 * 快速修正測試 - 驗證關鍵問題修正
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const testHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY
};

async function testQuickFix(message, expectedIntent, testName) {
  console.log(`\n=== ${testName} ===`);
  console.log(`測試訊息: "${message}"`);
  console.log(`預期意圖: ${expectedIntent}`);
  
  const url = `${SUPABASE_URL}/functions/v1/claude-chat`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: testHeaders,
      body: JSON.stringify({
        session_id: `quick-fix-test-${Date.now()}`,
        message: { 
          role: 'user', 
          content: message 
        },
        user_meta: { 
          external_id: 'quick-fix-test',
          display_name: '快速修正測試用戶'
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
    
    // 顯示回應摘要
    console.log('AI 回應摘要:', data.response.substring(0, 100) + '...');
    
    return passed;
    
  } catch (error) {
    console.log(`❌ 測試異常: ${error.message}`);
    return false;
  }
}

async function runQuickFixTests() {
  console.log('🔧 快速修正測試 - 驗證關鍵問題修正');
  console.log('=====================================');
  
  const testCases = [
    // 關鍵問題修正測試
    { message: '台北有什麼好吃的?', expectedIntent: 'OUT_OF_SCOPE', testName: '修正1: 其他地區查詢' },
    { message: '我生病了要看什麼醫生?', expectedIntent: 'OUT_OF_SCOPE', testName: '修正2: 醫療診斷查詢' },
    { message: '這週哪裡有音樂會？', expectedIntent: 'OUT_OF_SCOPE', testName: '修正3: 娛樂活動查詢' },
    { message: '你好', expectedIntent: 'VAGUE_CHAT', testName: '修正4: 問候語' },
    { message: '哈囉你喜歡什麼顏色？', expectedIntent: 'VAGUE_CHAT', testName: '修正5: 閒聊話題' },
    { message: '我今天心情不好…', expectedIntent: 'VAGUE_CHAT', testName: '修正6: 情感表達' },
    { message: '附近有美食跟水電行嗎？', expectedIntent: 'MIXED_INTENT', testName: '修正7: 多意圖檢測' }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    const passed = await testQuickFix(
      testCase.message,
      testCase.expectedIntent,
      testCase.testName
    );
    
    if (passed) {
      passedTests++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n=====================================');
  console.log('🏁 快速修正測試完成');
  console.log(`通過: ${passedTests}/${totalTests}`);
  console.log(`成功率: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有關鍵問題修正成功！');
  } else {
    console.log('⚠️ 仍有問題需要進一步修正');
  }
}

// 執行測試
runQuickFixTests().catch(error => {
  console.error('測試執行失敗:', error);
  process.exit(1);
});
