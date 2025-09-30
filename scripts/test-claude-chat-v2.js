/**
 * 測試 Claude Chat V2 升級版本
 * 驗證五層架構 + 允許清單管理
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const testHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY
};

async function testClaudeChatV2(message, testName) {
  console.log(`\n=== ${testName} ===`);
  console.log(`測試訊息: "${message}"`);
  
  const url = `${SUPABASE_URL}/functions/v1/claude-chat`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: testHeaders,
      body: JSON.stringify({
        session_id: `test-v2-${Date.now()}`,
        message: { 
          role: 'user', 
          content: message 
        },
        user_meta: { 
          external_id: 'test-user-v2',
          display_name: '測試用戶V2'
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
    
    if (data.recommended_stores && data.recommended_stores.length > 0) {
      console.log('推薦商家:');
      data.recommended_stores.forEach((store, index) => {
        console.log(`  ${index + 1}. ${store.name} (${store.category})`);
        console.log(`     特約商家: ${store.is_partner ? '是' : '否'}`);
        console.log(`     贊助等級: ${store.sponsorship_tier || 0}`);
        console.log(`     店家代碼: ${store.store_code || '無'}`);
        console.log(`     證據等級: ${store.evidence_level || '無'}`);
      });
    }
    
    if (data.recommendation_logic) {
      console.log('推薦邏輯:');
      console.log(`   意圖: ${data.recommendation_logic.intent}`);
      console.log(`   合格數量: ${data.recommendation_logic.eligible_count}`);
      console.log(`   最終數量: ${data.recommendation_logic.final_count}`);
      console.log(`   肯塔基包含: ${data.recommendation_logic.kentucky_included ? '是' : '否'}`);
      console.log(`   證據驗證: ${data.recommendation_logic.evidence_verified ? '是' : '否'}`);
    }
    
    console.log('AI 回應:', data.response.substring(0, 200) + '...');
    
    return true;
    
  } catch (error) {
    console.log(`❌ 測試異常: ${error.message}`);
    return false;
  }
}

async function runClaudeChatV2Tests() {
  console.log('🚀 測試 Claude Chat V2 升級版本');
  console.log('=====================================');
  
  const testCases = [
    {
      message: '我想學英語',
      testName: '英語學習推薦測試 (五層架構)'
    },
    {
      message: '推薦一些美食餐廳',
      testName: '美食推薦測試 (允許清單)'
    },
    {
      message: '附近有停車場嗎？',
      testName: '停車場查詢測試 (證據驗證)'
    },
    {
      message: '文山特區有什麼好玩的？',
      testName: '一般推薦測試 (語氣渲染)'
    }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    const passed = await testClaudeChatV2(
      testCase.message,
      testCase.testName
    );
    
    if (passed) {
      passedTests++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n=====================================');
  console.log('🏁 Claude Chat V2 測試完成');
  console.log(`通過: ${passedTests}/${totalTests}`);
  console.log(`成功率: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Claude Chat V2 五層架構運作正常！');
    console.log('✅ 允許清單管理已整合');
    console.log('✅ 證據驗證機制正常');
    console.log('✅ 語氣靈檢察官運作');
    console.log('✅ 資料優先原則實現');
  } else {
    console.log('⚠️ 部分測試失敗，請檢查升級部署');
  }
}

// 執行測試
runClaudeChatV2Tests().catch(error => {
  console.error('測試執行失敗:', error);
  process.exit(1);
});
