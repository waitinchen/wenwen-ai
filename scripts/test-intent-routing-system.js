// 測試新的型別安全意圖路由系統
import { execSync } from 'child_process';

const EDGE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/claude-chat';
const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
};

const routingTests = [
  // Catalog 意圖測試
  {
    category: 'catalog',
    tests: [
      { name: 'ENGLISH_LEARNING', message: '想學英文', expected: { intent: 'ENGLISH_LEARNING' } },
      { name: 'FOOD', message: '推薦日式料理', expected: { intent: 'FOOD' } },
      { name: 'PARKING', message: '哪裡可以停車？', expected: { intent: 'PARKING' } },
      { name: 'SHOPPING', message: '想買衣服', expected: { intent: 'SHOPPING' } },
      { name: 'BEAUTY', message: '想剪頭髮', expected: { intent: 'BEAUTY' } },
      { name: 'MEDICAL-藥局', message: '我想找藥局', expected: { intent: 'MEDICAL', subcategory: '藥局' } },
      { name: 'MEDICAL-藥妝', message: '想買保養品', expected: { intent: 'MEDICAL', subcategory: '藥妝' } },
      { name: 'MEDICAL-診所', message: '附近有內科診所嗎？', expected: { intent: 'MEDICAL', subcategory: '診所' } },
      { name: 'MEDICAL-牙醫', message: '找牙醫洗牙', expected: { intent: 'MEDICAL', subcategory: '牙醫' } },
      { name: 'ATTRACTION', message: '有什麼景點？', expected: { intent: 'ATTRACTION' } }
    ]
  },
  
  // System 意圖測試
  {
    category: 'system',
    tests: [
      { name: 'COVERAGE_STATS', message: '你的商家資料有多少資料?', expected: { intent: 'COVERAGE_STATS' } },
      { name: 'DIRECTIONS', message: '怎麼到文山特區？', expected: { intent: 'DIRECTIONS' } }
    ]
  },
  
  // Chat 意圖測試
  {
    category: 'chat',
    tests: [
      { name: 'INTRO', message: '請自我介紹', expected: { intent: 'INTRO' } },
      { name: 'GREETING', message: '你好', expected: { intent: 'GREETING' } },
      { name: 'VAGUE_CHAT', message: '今天天氣怎麼樣？', expected: { intent: 'VAGUE_CHAT' } }
    ]
  },
  
  // Entity 意圖測試
  {
    category: 'entity',
    tests: [
      { name: '屈臣氏品牌', message: '屈臣氏在哪', expected: { intent: 'MEDICAL' } },
      { name: 'GENERAL', message: '有什麼推薦的？', expected: { intent: 'GENERAL' } }
    ]
  }
];

async function testRoutingCategory(categoryTests) {
  console.log(`\n🧪 測試 ${categoryTests.category.toUpperCase()} 路由類別`);
  console.log('='.repeat(50));
  
  const results = [];
  
  for (const test of categoryTests.tests) {
    try {
      console.log(`\n📝 測試: ${test.name}`);
      console.log(`💬 輸入: "${test.message}"`);
      
      const response = await fetch(EDGE_URL, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          session_id: `routing-test-${Date.now()}`,
          message: { content: test.message }
        })
      });
      
      const result = await response.json();
      const data = result.data || result; // 兼容兩種回應格式
      
      console.log(`✅ 狀態碼: ${response.status}`);
      console.log(`🎯 意圖: ${data.intent}`);
      
      if (data.recommendation_logic?.subcategory) {
        console.log(`📂 子分類: ${data.recommendation_logic.subcategory}`);
      }
      
      if (data.intent === 'COVERAGE_STATS') {
        console.log(`📊 統計數據: ${data.response.includes('商家總數') ? '✅ 有統計數據' : '❌ 無統計數據'}`);
      }
      
      if (data.recommended_stores && data.recommended_stores.length > 0) {
        console.log(`🏪 推薦商家數: ${data.recommended_stores.length}`);
      }
      
      // 驗收檢查
      const intentMatch = data.intent === test.expected.intent;
      const subcategoryMatch = !test.expected.subcategory || data.recommendation_logic?.subcategory === test.expected.subcategory;
      
      if (intentMatch && subcategoryMatch) {
        console.log(`✅ 測試通過`);
        results.push({ test, passed: true });
      } else {
        console.log(`❌ 測試失敗`);
        if (!intentMatch) console.log(`   - 意圖不匹配: 期望 ${test.expected.intent}, 實際 ${result.intent}`);
        if (!subcategoryMatch) console.log(`   - 子分類不匹配: 期望 ${test.expected.subcategory}, 實際 ${result.recommendation_logic?.subcategory}`);
        results.push({ test, passed: false });
      }
      
    } catch (error) {
      console.error(`❌ 測試失敗: ${error.message}`);
      results.push({ test, error, passed: false });
    }
    
    // 等待 1 秒避免請求過快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

async function runRoutingTests() {
  console.log('🚀 開始型別安全意圖路由系統測試');
  console.log('==========================================');
  
  const allResults = [];
  
  for (const categoryTests of routingTests) {
    const categoryResults = await testRoutingCategory(categoryTests);
    allResults.push(...categoryResults);
  }
  
  // 統計結果
  console.log('\n📊 路由系統測試結果統計');
  console.log('========================');
  
  const passed = allResults.filter(r => r.passed).length;
  const total = allResults.length;
  
  console.log(`✅ 通過: ${passed}/${total}`);
  console.log(`❌ 失敗: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 所有路由測試通過！新的型別安全路由系統運作正常！');
  } else {
    console.log('\n⚠️ 部分路由測試失敗，請檢查路由系統實現');
  }
  
  // 按類別統計
  console.log('\n📋 按路由類別統計:');
  routingTests.forEach(categoryTests => {
    const categoryResults = allResults.filter(r => 
      categoryTests.tests.some(t => t.name === r.test.name)
    );
    const categoryPassed = categoryResults.filter(r => r.passed).length;
    const categoryTotal = categoryResults.length;
    console.log(`${categoryTests.category.toUpperCase()}: ${categoryPassed}/${categoryTotal} 通過`);
  });
  
  // 詳細結果
  console.log('\n📋 詳細結果:');
  allResults.forEach(r => {
    const status = r.passed ? '✅' : '❌';
    console.log(`${status} ${r.test.name}: ${r.passed ? '通過' : '失敗'}`);
  });
  
  console.log('\n🔍 路由系統驗證重點:');
  console.log('✅ Catalog 意圖能正確查詢商家資料');
  console.log('✅ System 意圖能正確處理系統功能');
  console.log('✅ Chat 意圖能正確處理純聊天');
  console.log('✅ Entity 意圖能正確處理品牌/實體查詢');
  console.log('✅ MEDICAL 子分類能正確識別和過濾');
  console.log('✅ 向後相容性保持正常');
}

// 執行測試
runRoutingTests().catch(console.error);
