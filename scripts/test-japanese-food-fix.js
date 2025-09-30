/**
 * 測試日料推薦修正
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const testHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY
};

async function testJapaneseFoodFix(message, testName) {
  console.log(`\n=== ${testName} ===`);
  console.log(`測試訊息: "${message}"`);
  
  const url = `${SUPABASE_URL}/functions/v1/claude-chat`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: testHeaders,
      body: JSON.stringify({
        session_id: `japanese-food-fix-test-${Date.now()}`,
        message: { 
          role: 'user', 
          content: message 
        },
        user_meta: { 
          external_id: 'japanese-food-fix-test',
          display_name: '日料修正測試用戶'
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
    
    console.log('版本:', data.version);
    console.log('意圖:', data.intent);
    console.log('信心度:', data.confidence);
    console.log('推薦商家數量:', data.recommended_stores?.length || 0);
    
    console.log('AI 回應:');
    console.log(data.response);
    
    // 檢查是否為誠實回應
    const isHonestResponse = data.response.includes('沒有找到專門的日料餐廳') || 
                           data.response.includes('沒有找到專門的日式餐廳')
    
    console.log('是否為誠實回應:', isHonestResponse ? '✅' : '❌');
    
    // 檢查是否推薦了非日料餐廳
    const hasNonJapaneseRestaurants = data.recommended_stores && 
                                     data.recommended_stores.some(store => 
                                       store.name.includes('早餐') || 
                                       store.name.includes('Kitchen') || 
                                       store.name.includes('Ease')
                                     )
    
    console.log('是否推薦非日料餐廳:', hasNonJapaneseRestaurants ? '❌ 問題' : '✅ 正確');
    
    const passed = isHonestResponse && !hasNonJapaneseRestaurants;
    console.log(passed ? '✅ 修正成功' : '❌ 修正失敗');
    
    return passed;
    
  } catch (error) {
    console.log(`❌ 測試異常: ${error.message}`);
    return false;
  }
}

async function runJapaneseFoodFixTests() {
  console.log('🍣 測試日料推薦修正');
  console.log('==================');
  
  const testCases = [
    { message: '有日料嗎?', testName: '日料查詢修正' },
    { message: '想吃日式料理', testName: '日式料理查詢修正' },
    { message: '推薦一些壽司', testName: '壽司查詢修正' },
    { message: '有拉麵店嗎?', testName: '拉麵查詢修正' }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    const passed = await testJapaneseFoodFix(
      testCase.message,
      testCase.testName
    );
    
    if (passed) {
      passedTests++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n==================');
  console.log('🏁 日料推薦修正測試完成');
  console.log(`通過: ${passedTests}/${totalTests}`);
  console.log(`成功率: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 日料推薦修正完全成功！');
    console.log('✅ 系統現在會誠實告知沒有日料餐廳');
    console.log('✅ 不再推薦不相關的早餐店或西式餐廳');
  } else {
    console.log('⚠️ 仍有問題需要進一步修正');
  }
}

// 執行測試
runJapaneseFoodFixTests().catch(error => {
  console.error('測試執行失敗:', error);
  process.exit(1);
});