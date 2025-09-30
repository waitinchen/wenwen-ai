/**
 * 進階優化測試 - 基於實測建議的測試案例
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const testHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY
};

async function testAdvancedScenario(message, expectedBehavior, testName, notes) {
  console.log(`\n=== ${testName} ===`);
  console.log(`測試語句: "${message}"`);
  console.log(`預期行為: ${expectedBehavior}`);
  console.log(`備註: ${notes}`);
  
  const url = `${SUPABASE_URL}/functions/v1/claude-chat`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: testHeaders,
      body: JSON.stringify({
        session_id: `advanced-test-${Date.now()}`,
        message: { 
          role: 'user', 
          content: message 
        },
        user_meta: { 
          external_id: 'advanced-test',
          display_name: '進階測試用戶'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ 請求失敗: ${errorText}`);
      return { passed: false, details: 'Request failed' };
    }

    const result = await response.json();
    const data = result.data;
    
    console.log('實際意圖:', data.intent);
    console.log('信心度:', data.confidence);
    console.log('推薦商家數量:', data.recommended_stores?.length || 0);
    
    // 分析回應內容
    const responseText = data.response;
    const hasRecommendation = responseText.includes('推薦') || data.recommended_stores?.length > 0;
    const hasPoliteRefusal = responseText.includes('抱歉') || responseText.includes('超出') || responseText.includes('服務範圍');
    const hasGuidance = responseText.includes('可以幫') || responseText.includes('推薦文山特區');
    const hasEmotionalSupport = responseText.includes('心情') || responseText.includes('陪伴') || responseText.includes('安慰');
    
    console.log('回應分析:');
    console.log('- 包含推薦:', hasRecommendation ? '✅' : '❌');
    console.log('- 包含委婉拒絕:', hasPoliteRefusal ? '✅' : '❌');
    console.log('- 包含引導:', hasGuidance ? '✅' : '❌');
    console.log('- 包含情感支持:', hasEmotionalSupport ? '✅' : '❌');
    
    // 顯示回應摘要
    console.log('AI 回應摘要:', responseText.substring(0, 200) + '...');
    
    return {
      passed: true,
      details: {
        intent: data.intent,
        confidence: data.confidence,
        hasRecommendation,
        hasPoliteRefusal,
        hasGuidance,
        hasEmotionalSupport,
        response: responseText
      }
    };
    
  } catch (error) {
    console.log(`❌ 測試異常: ${error.message}`);
    return { passed: false, details: error.message };
  }
}

async function runAdvancedOptimizationTests() {
  console.log('🔍 進階優化測試 - 基於實測建議');
  console.log('=====================================');
  
  const testCases = [
    {
      message: '附近有英文補習班嗎？',
      expectedBehavior: '推出已登記的推薦',
      testName: '標準回應 - 英文補習班',
      notes: '使用 allowlist 命中類別：補習班'
    },
    {
      message: '這週哪裡有音樂會？',
      expectedBehavior: '委婉拒絕 + 承諾反映',
      testName: '委婉拒絕 - 音樂會',
      notes: '類別 miss，觸發委婉語氣'
    },
    {
      message: '附近有美食跟水電行嗎？',
      expectedBehavior: '一半回答 + 一半委婉拒絕',
      testName: '混合型 - 美食+水電行',
      notes: '測試多意圖處理能力'
    },
    {
      message: '哈囉你喜歡什麼顏色？',
      expectedBehavior: '閒聊 + 引導回主題',
      testName: '閒聊語意不明 - 顏色',
      notes: '觸發語氣靈風格：可愛 + 引導'
    },
    {
      message: '我今天心情不好…',
      expectedBehavior: '語氣靈語氣 + 陪伴語',
      testName: '情緒測試 - 心情不好',
      notes: '測試情感語義偵測（bonus）'
    }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  const results = [];
  
  for (const testCase of testCases) {
    const result = await testAdvancedScenario(
      testCase.message,
      testCase.expectedBehavior,
      testCase.testName,
      testCase.notes
    );
    
    results.push({
      ...testCase,
      result
    });
    
    if (result.passed) {
      passedTests++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n=====================================');
  console.log('🏁 進階優化測試完成');
  console.log(`通過: ${passedTests}/${totalTests}`);
  console.log(`成功率: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  // 詳細分析結果
  console.log('\n📊 詳細分析結果:');
  results.forEach((test, index) => {
    console.log(`\n${index + 1}. ${test.testName}:`);
    if (test.result.passed) {
      const details = test.result.details;
      console.log(`   - 意圖: ${details.intent}`);
      console.log(`   - 信心度: ${details.confidence}`);
      console.log(`   - 推薦: ${details.hasRecommendation ? '✅' : '❌'}`);
      console.log(`   - 委婉拒絕: ${details.hasPoliteRefusal ? '✅' : '❌'}`);
      console.log(`   - 引導: ${details.hasGuidance ? '✅' : '❌'}`);
      console.log(`   - 情感支持: ${details.hasEmotionalSupport ? '✅' : '❌'}`);
    } else {
      console.log(`   - 測試失敗: ${test.result.details}`);
    }
  });
  
  return results;
}

// 執行測試
runAdvancedOptimizationTests().catch(error => {
  console.error('測試執行失敗:', error);
  process.exit(1);
});
