/**
 * 允許清單推薦引擎整合測試
 * 測試新的 allowlist-recommendation Edge Function
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUwNzUyNzIsImV4cCI6MjA1MDY1MTI3Mn0.2nQ8Y8Q8Y8Q8Y8Q8Y8Q8Y8Q8Y8Q8Y8Q8Y8Q8Y8Q8';

const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/allowlist-recommendation`;

const testHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY
};

async function testAllowlistRecommendation(message, expectedIntent, testName) {
  console.log(`\n=== ${testName} ===`);
  console.log(`測試訊息: "${message}"`);
  console.log(`預期意圖: ${expectedIntent}`);
  
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
    console.log('意圖:', data.intent);
    console.log('推薦商家數量:', data.recommended_stores?.length || 0);
    
    if (data.recommended_stores && data.recommended_stores.length > 0) {
      console.log('推薦商家:');
      data.recommended_stores.forEach((store, index) => {
        console.log(`  ${index + 1}. ${store.name} (${store.category})`);
        console.log(`     贊助等級: ${store.sponsorship_tier || 0}`);
        console.log(`     證據等級: ${store.evidence_level || 'verified'}`);
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
    
    console.log('AI 回應:', data.response);
    
    // 驗證結果
    const checks = [];
    
    // 檢查意圖是否正確
    if (data.intent === expectedIntent) {
      checks.push('✅ 意圖識別正確');
    } else {
      checks.push(`❌ 意圖識別錯誤: 預期 ${expectedIntent}, 實際 ${data.intent}`);
    }
    
    // 檢查推薦商家數量
    if (data.recommended_stores && data.recommended_stores.length <= 3) {
      checks.push('✅ 推薦商家數量符合要求 (≤3)');
    } else {
      checks.push(`❌ 推薦商家數量過多: ${data.recommended_stores?.length || 0}`);
    }
    
    // 英語學習特殊檢查
    if (expectedIntent === 'english_learning') {
      const hasKentucky = data.recommended_stores?.some(s => 
        s.store_code === 'kentucky' || s.name.includes('肯塔基美語')
      );
      if (hasKentucky) {
        checks.push('✅ 英語學習包含肯塔基美語');
      } else {
        checks.push('❌ 英語學習未包含肯塔基美語');
      }
    }
    
    // 檢查所有推薦商家都有證據支持
    const allVerified = data.recommended_stores?.every(s => 
      s.evidence_level === 'verified' || s.evidence_level === 'pending_verification'
    );
    if (allVerified) {
      checks.push('✅ 所有推薦商家都有證據支持');
    } else {
      checks.push('❌ 部分推薦商家缺乏證據支持');
    }
    
    console.log('\n驗證結果:');
    checks.forEach(check => console.log(check));
    
    const allPassed = checks.every(check => check.startsWith('✅'));
    console.log(`\n${allPassed ? '✅ 測試通過' : '❌ 測試失敗'}`);
    
    return allPassed;
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 開始允許清單推薦引擎整合測試');
  console.log('=====================================');
  
  const testCases = [
    {
      message: '我想學英語',
      expectedIntent: 'english_learning',
      testName: '英語學習推薦測試'
    },
    {
      message: '推薦一些美食餐廳',
      expectedIntent: 'food',
      testName: '美食推薦測試'
    },
    {
      message: '附近有停車場嗎？',
      expectedIntent: 'parking',
      testName: '停車場查詢測試'
    },
    {
      message: '文山特區有什麼好玩的？',
      expectedIntent: 'general',
      testName: '一般推薦測試'
    },
    {
      message: '除了肯塔基美語，還有其他英語學習機構嗎？',
      expectedIntent: 'english_learning',
      testName: '英語學習追問測試'
    }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    const passed = await testAllowlistRecommendation(
      testCase.message,
      testCase.expectedIntent,
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
    console.log('🎉 所有測試通過！允許清單推薦引擎運作正常！');
  } else {
    console.log('⚠️ 部分測試失敗，請檢查 Edge Function 和資料庫設定');
  }
}

// 執行測試
runAllTests().catch(error => {
  console.error('測試執行失敗:', error);
  process.exit(1);
});
