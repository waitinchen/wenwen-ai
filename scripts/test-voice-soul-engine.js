#!/usr/bin/env node

/**
 * 語氣靈引擎 v2.0 測試腳本
 * 測試五層架構設計的完整流程
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// 測試用例
const testCases = [
  {
    name: '美食推薦測試',
    message: '有什麼美食推薦？',
    expectedIntent: 'FOOD',
    expectedStores: true,
    description: '測試美食意圖分類和餐飲商家推薦'
  },
  {
    name: '英語學習首次查詢',
    message: '我想學英語',
    expectedIntent: 'ENGLISH_LEARNING',
    expectedStores: true,
    expectedStoreName: '肯塔基美語',
    description: '測試英語學習意圖，應該只推薦肯塔基美語一家'
  },
  {
    name: '英語學習追問測試',
    message: '我想學英語，還有其他選擇嗎？',
    expectedIntent: 'ENGLISH_LEARNING',
    expectedStores: true,
    isFollowUp: true,
    description: '測試追問模式，應該推薦更多教育培訓商家'
  },
  {
    name: '停車場查詢測試',
    message: '附近有停車場嗎？',
    expectedIntent: 'PARKING',
    expectedStores: true,
    description: '測試停車場意圖分類和停車場商家推薦'
  },
  {
    name: '一般查詢測試',
    message: '文山特區有什麼好玩的？',
    expectedIntent: 'GENERAL',
    expectedStores: true,
    description: '測試一般意圖分類和綜合商家推薦'
  },
  {
    name: '不存在商家測試',
    message: '推薦一些外星餐廳',
    expectedIntent: 'GENERAL',
    expectedStores: false,
    description: '測試無相關商家時的處理'
  }
];

// 測試函數
async function testVoiceSoulEngine() {
  console.log('🎯 語氣靈引擎 v2.0 測試開始\n');
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    console.log(`📋 測試: ${testCase.name}`);
    console.log(`📝 描述: ${testCase.description}`);
    console.log(`💬 訊息: "${testCase.message}"`);
    
    try {
      const result = await testSingleCase(testCase);
      
      if (result.success) {
        console.log('✅ 測試通過');
        passedTests++;
      } else {
        console.log('❌ 測試失敗');
        console.log(`   原因: ${result.error}`);
      }
      
      console.log(`🎯 意圖: ${result.intent} (預期: ${testCase.expectedIntent})`);
      console.log(`🏪 商家數量: ${result.storeCount} (預期: ${testCase.expectedStores ? '>0' : '0'})`);
      
      if (testCase.expectedStoreName) {
        const hasExpectedStore = result.stores.some(store => 
          store.name.includes(testCase.expectedStoreName)
        );
        console.log(`🎓 包含預期商家: ${hasExpectedStore ? '✅' : '❌'} (${testCase.expectedStoreName})`);
      }
      
      if (result.response) {
        console.log(`🤖 AI回應: ${result.response.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log('❌ 測試異常');
      console.log(`   錯誤: ${error.message}`);
    }
    
    console.log('─'.repeat(60));
  }
  
  // 測試總結
  console.log('\n📊 測試總結');
  console.log(`✅ 通過: ${passedTests}/${totalTests}`);
  console.log(`❌ 失敗: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 所有測試通過！語氣靈引擎 v2.0 運行正常！');
  } else {
    console.log('\n⚠️ 部分測試失敗，請檢查相關功能。');
  }
}

// 單個測試用例
async function testSingleCase(testCase) {
  try {
    // 模擬 Edge Function 調用
    const response = await fetch(`${SUPABASE_URL}/functions/v1/claude-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        session_id: `test-${Date.now()}`,
        message: {
          role: 'user',
          content: testCase.message
        },
        user_meta: {
          external_id: 'test-user',
          display_name: '測試用戶',
          avatar_url: ''
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // 驗證結果
    const success = validateResult(data, testCase);
    
    return {
      success,
      intent: data.intent,
      storeCount: data.recommended_stores?.length || 0,
      stores: data.recommended_stores || [],
      response: data.response,
      debug: data.debug,
      error: success ? null : '驗證失敗'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      intent: null,
      storeCount: 0,
      stores: [],
      response: null,
      debug: null
    };
  }
}

// 驗證測試結果
function validateResult(data, testCase) {
  // 檢查意圖分類
  if (data.intent !== testCase.expectedIntent) {
    return false;
  }
  
  // 檢查商家推薦
  const hasStores = data.recommended_stores && data.recommended_stores.length > 0;
  if (testCase.expectedStores && !hasStores) {
    return false;
  }
  if (!testCase.expectedStores && hasStores) {
    return false;
  }
  
  // 檢查特定商家名稱
  if (testCase.expectedStoreName) {
    const hasExpectedStore = data.recommended_stores.some(store => 
      store.name.includes(testCase.expectedStoreName)
    );
    if (!hasExpectedStore) {
      return false;
    }
  }
  
  // 檢查追問模式
  if (testCase.isFollowUp) {
    if (!data.debug?.isFollowUp) {
      return false;
    }
  }
  
  return true;
}

// 執行測試
testVoiceSoulEngine().catch(console.error);
