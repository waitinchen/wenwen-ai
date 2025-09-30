/**
 * 測試四種回應模式
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const testHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY
};

async function testResponseMode(message, expectedIntent, testName) {
  console.log(`\n=== ${testName} ===`);
  console.log(`測試訊息: "${message}"`);
  console.log(`預期意圖: ${expectedIntent}`);
  
  const url = `${SUPABASE_URL}/functions/v1/claude-chat`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: testHeaders,
      body: JSON.stringify({
        session_id: `response-mode-test-${Date.now()}`,
        message: { 
          role: 'user', 
          content: message 
        },
        user_meta: { 
          external_id: 'response-mode-test',
          display_name: '回應模式測試用戶'
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
    console.log(passed ? '✅ 測試通過' : '❌ 測試失敗');
    
    // 顯示回應摘要
    console.log('AI 回應摘要:', data.response.substring(0, 150) + '...');
    
    return passed;
    
  } catch (error) {
    console.log(`❌ 測試異常: ${error.message}`);
    return false;
  }
}

async function runFourResponseModeTests() {
  console.log('🔍 測試四種回應模式');
  console.log('==================');
  
  const testCases = [
    // 1. 核心服務範圍標準回應
    { message: '有日料嗎?', expectedIntent: 'FOOD', testName: '核心服務 - 日料推薦' },
    { message: '哪裡可以停車?', expectedIntent: 'PARKING', testName: '核心服務 - 停車查詢' },
    { message: '有英語補習班嗎?', expectedIntent: 'ENGLISH_LEARNING', testName: '核心服務 - 英語學習' },
    { message: '你的資料庫有多少商家?', expectedIntent: 'STATISTICS', testName: '核心服務 - 統計查詢' },
    
    // 2. 委婉拒絕回應
    { message: '台北有什麼好吃的?', expectedIntent: 'OUT_OF_SCOPE', testName: '委婉拒絕 - 其他地區' },
    { message: '投資股票有什麼建議?', expectedIntent: 'OUT_OF_SCOPE', testName: '委婉拒絕 - 投資理財' },
    { message: '我生病了要看什麼醫生?', expectedIntent: 'OUT_OF_SCOPE', testName: '委婉拒絕 - 醫療診斷' },
    { message: '法律糾紛怎麼處理?', expectedIntent: 'OUT_OF_SCOPE', testName: '委婉拒絕 - 法律諮詢' },
    
    // 3. 語意不明或閒聊
    { message: '你好', expectedIntent: 'VAGUE_CHAT', testName: '語意不明 - 問候' },
    { message: '今天天氣怎麼樣?', expectedIntent: 'VAGUE_CHAT', testName: '語意不明 - 天氣' },
    { message: '我好無聊', expectedIntent: 'VAGUE_CHAT', testName: '語意不明 - 無聊' },
    { message: '沒事', expectedIntent: 'VAGUE_CHAT', testName: '語意不明 - 沒事' },
    
    // 4. 確認回應
    { message: '好', expectedIntent: 'CONFIRMATION', testName: '確認回應 - 好' },
    { message: '謝謝', expectedIntent: 'CONFIRMATION', testName: '確認回應 - 謝謝' },
    { message: '了解', expectedIntent: 'CONFIRMATION', testName: '確認回應 - 了解' }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    const passed = await testResponseMode(
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
  console.log('🏁 四種回應模式測試完成');
  console.log(`通過: ${passedTests}/${totalTests}`);
  console.log(`成功率: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  // 按回應模式分組統計
  const modeStats = {
    '核心服務': 0,
    '委婉拒絕': 0,
    '語意不明': 0,
    '確認回應': 0
  };
  
  testCases.forEach((testCase, index) => {
    if (index < 4) modeStats['核心服務']++;
    else if (index < 8) modeStats['委婉拒絕']++;
    else if (index < 12) modeStats['語意不明']++;
    else modeStats['確認回應']++;
  });
  
  console.log('\n📊 各回應模式統計:');
  Object.entries(modeStats).forEach(([mode, count]) => {
    console.log(`- ${mode}: ${count} 個測試`);
  });
}

// 執行測試
runFourResponseModeTests().catch(error => {
  console.error('測試執行失敗:', error);
  process.exit(1);
});
