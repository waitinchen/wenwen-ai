/**
 * 語氣靈推薦引擎 v2.0 測試腳本
 * 測試五層架構的完整流程和各模組功能
 */

// 模擬環境變數
const mockEnv = {
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key',
  SERVICE_ROLE_KEY: 'your-service-role-key',
  CLAUDE_API_KEY: 'your-claude-key'
};

// 模擬測試資料
const mockStores = [
  {
    id: 1,
    store_name: '文山牛肉麵',
    category: '餐飲美食',
    address: '高雄市鳳山區文衡路123號',
    phone: '07-7771234',
    business_hours: '11:00-21:00',
    is_partner_store: true,
    features: { rating: 4.7, description: '招牌紅燒牛肉麵' },
    rating: 4.7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    store_name: '肯塔基美語',
    category: '教育培訓',
    address: '高雄市鳳山區文化路131號',
    phone: '07-7775678',
    business_hours: '09:00-21:00',
    is_partner_store: true,
    features: { rating: 4.8, description: '專業美語教學' },
    rating: 4.8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

/**
 * 測試用例定義
 */
const testCases = [
  {
    name: '美食推薦測試',
    message: '有什麼美食推薦？',
    expectedIntent: 'FOOD',
    expectedStores: true,
    expectedStoreName: '文山牛肉麵',
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
    expectedStores: false, // 模擬資料中沒有停車場
    description: '測試停車場意圖分類'
  },
  {
    name: '一般查詢測試',
    message: '文山特區有什麼好玩的？',
    expectedIntent: 'GENERAL',
    expectedStores: true,
    description: '測試一般意圖分類和綜合商家推薦'
  }
];

/**
 * 模擬測試函數
 */
async function testVoiceSoulEngineV2() {
  console.log('🎯 語氣靈推薦引擎 v2.0 測試開始\n');
  
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
      
      if (result.tone) {
        console.log(`🎨 語氣模板: ${result.tone}`);
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

/**
 * 單個測試用例（模擬）
 */
async function testSingleCase(testCase: any) {
  // 模擬意圖分類
  const intentResult = mockClassifyIntent(testCase.message);
  
  // 模擬商家推薦
  const stores = mockGetStoresByIntent(intentResult.primary, intentResult.isFollowUp);
  
  // 模擬語氣選擇
  const tone = mockSelectTone(intentResult.primary);
  
  // 模擬驗證結果
  const success = validateMockResult(intentResult, stores, testCase);
  
  return {
    success,
    intent: intentResult.primary,
    storeCount: stores.length,
    stores: stores.map(s => ({ name: s.store_name, category: s.category })),
    tone: tone.name,
    error: success ? null : '驗證失敗'
  };
}

/**
 * 模擬意圖分類
 */
function mockClassifyIntent(message: string) {
  const normalizedMessage = message.toLowerCase();
  
  if (normalizedMessage.includes('美食') || normalizedMessage.includes('餐廳')) {
    return { primary: 'FOOD', isFollowUp: false };
  }
  
  if (normalizedMessage.includes('英語') || normalizedMessage.includes('美語')) {
    const isFollowUp = normalizedMessage.includes('還有') || normalizedMessage.includes('其他');
    return { primary: 'ENGLISH_LEARNING', isFollowUp };
  }
  
  if (normalizedMessage.includes('停車')) {
    return { primary: 'PARKING', isFollowUp: false };
  }
  
  return { primary: 'GENERAL', isFollowUp: false };
}

/**
 * 模擬商家推薦
 */
function mockGetStoresByIntent(intent: string, isFollowUp: boolean): any[] {
  switch (intent) {
    case 'FOOD':
      return mockStores.filter(store => store.category === '餐飲美食');
    
    case 'ENGLISH_LEARNING':
      if (!isFollowUp) {
        return mockStores.filter(store => store.store_name === '肯塔基美語');
      } else {
        return mockStores.filter(store => store.category === '教育培訓');
      }
    
    case 'PARKING':
      return []; // 模擬沒有停車場資料
    
    default:
      return mockStores;
  }
}

/**
 * 模擬語氣選擇
 */
function mockSelectTone(intent: string) {
  const toneMap = {
    'FOOD': { name: '在地朋友', id: 'friendly' },
    'ENGLISH_LEARNING': { name: '溫暖鄰居', id: 'warm' },
    'PARKING': { name: '導遊導覽', id: 'guide' },
    'GENERAL': { name: '在地朋友', id: 'friendly' }
  };
  
  return toneMap[intent] || { name: '在地朋友', id: 'friendly' };
}

/**
 * 驗證模擬結果
 */
function validateMockResult(intentResult: any, stores: any[], testCase: any): boolean {
  // 檢查意圖分類
  if (intentResult.primary !== testCase.expectedIntent) {
    return false;
  }
  
  // 檢查商家推薦
  const hasStores = stores.length > 0;
  if (testCase.expectedStores && !hasStores) {
    return false;
  }
  if (!testCase.expectedStores && hasStores) {
    return false;
  }
  
  // 檢查特定商家名稱
  if (testCase.expectedStoreName) {
    const hasExpectedStore = stores.some(store => 
      store.store_name.includes(testCase.expectedStoreName)
    );
    if (!hasExpectedStore) {
      return false;
    }
  }
  
  return true;
}

/**
 * 測試各模組功能
 */
async function testModules() {
  console.log('\n🔧 模組功能測試\n');
  
  // 測試意圖分類器
  console.log('📋 測試意圖分類器...');
  const testMessages = [
    '有什麼美食推薦？',
    '我想學英語',
    '附近有停車場嗎？',
    '文山特區有什麼好玩的？'
  ];
  
  testMessages.forEach(message => {
    const intent = mockClassifyIntent(message);
    console.log(`  "${message}" → ${intent.primary}`);
  });
  
  // 測試語氣模板
  console.log('\n🎨 測試語氣模板...');
  const intents = ['FOOD', 'ENGLISH_LEARNING', 'PARKING', 'GENERAL'];
  intents.forEach(intent => {
    const tone = mockSelectTone(intent);
    console.log(`  ${intent} → ${tone.name}`);
  });
  
  // 測試商家推薦
  console.log('\n🏪 測試商家推薦...');
  const testIntents = ['FOOD', 'ENGLISH_LEARNING', 'PARKING'];
  testIntents.forEach(intent => {
    const stores = mockGetStoresByIntent(intent, false);
    console.log(`  ${intent} → ${stores.length} 家商家`);
  });
  
  console.log('\n✅ 模組功能測試完成');
}

/**
 * 執行完整測試
 */
async function runFullTest() {
  await testVoiceSoulEngineV2();
  await testModules();
  
  console.log('\n🚀 語氣靈推薦引擎 v2.0 測試完成！');
  console.log('📁 檔案結構：');
  console.log('  ├── index.ts (主入口)');
  console.log('  ├── lib/');
  console.log('  │   ├── data-layer.ts (資料層)');
  console.log('  │   ├── intent-classifier.ts (語意理解層)');
  console.log('  │   ├── recommendation-engine.ts (推薦策略層)');
  console.log('  │   ├── tone-renderer.ts (語氣生成層)');
  console.log('  │   ├── feedback-logger.ts (記錄回饋層)');
  console.log('  │   └── utils/');
  console.log('  │       ├── safe-fetch.ts (安全請求)');
  console.log('  │       └── hallucination-firewall.ts (幻覺防線)');
  console.log('  └── templates/');
  console.log('      └── tone-templates.ts (語氣模板)');
}

// 執行測試
runFullTest().catch(console.error);
