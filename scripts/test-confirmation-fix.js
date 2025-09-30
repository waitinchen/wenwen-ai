/**
 * 測試確認回應修正
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const testHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY
};

async function testConfirmationResponse(message, testName) {
  console.log(`\n=== ${testName} ===`);
  console.log(`測試訊息: "${message}"`);
  
  const url = `${SUPABASE_URL}/functions/v1/claude-chat`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: testHeaders,
      body: JSON.stringify({
        session_id: `confirmation-test-${Date.now()}`,
        message: { 
          role: 'user', 
          content: message 
        },
        user_meta: { 
          external_id: 'confirmation-test',
          display_name: '確認測試用戶'
        }
      })
    });

    console.log(`HTTP 狀態: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ 請求失敗: ${errorText}`);
      return false;
    }

    const result = await response.json();
    const data = result.data;
    
    console.log('✅ 請求成功');
    console.log('版本:', data.version);
    console.log('意圖:', data.intent);
    console.log('信心度:', data.confidence);
    console.log('推薦商家數量:', data.recommended_stores?.length || 0);
    
    if (data.intent === 'CONFIRMATION') {
      console.log('✅ 意圖識別正確：CONFIRMATION');
    } else {
      console.log(`❌ 意圖識別錯誤：${data.intent} (預期: CONFIRMATION)`);
    }
    
    console.log('AI 回應:');
    console.log(data.response);
    
    return data.intent === 'CONFIRMATION';
    
  } catch (error) {
    console.log(`❌ 測試異常: ${error.message}`);
    return false;
  }
}

async function runConfirmationTests() {
  console.log('🔍 測試確認回應修正');
  console.log('==================');
  
  const testCases = [
    { message: '好', testName: '簡單確認測試' },
    { message: '好的', testName: '標準確認測試' },
    { message: '可以', testName: '同意確認測試' },
    { message: '謝謝', testName: '感謝確認測試' },
    { message: '了解', testName: '理解確認測試' }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    const passed = await testConfirmationResponse(
      testCase.message,
      testCase.testName
    );
    
    if (passed) {
      passedTests++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n==================');
  console.log('🏁 確認回應測試完成');
  console.log(`通過: ${passedTests}/${totalTests}`);
  console.log(`成功率: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 確認回應修正成功！');
    console.log('✅ 現在系統能正確識別確認回應');
    console.log('✅ 不會再錯誤推薦新商家');
  } else {
    console.log('⚠️ 部分測試失敗，請檢查修正');
  }
}

// 執行測試
runConfirmationTests().catch(error => {
  console.error('測試執行失敗:', error);
  process.exit(1);
});
