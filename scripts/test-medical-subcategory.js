// MEDICAL 子分類與統計修復驗收測試（8/8）
import { execSync } from 'child_process';

const EDGE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/claude-chat';
const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
};

const testCases = [
  {
    id: 1,
    name: '藥局',
    message: '我想找藥局',
    expected: { intent: 'MEDICAL', subcategory: '藥局' }
  },
  {
    id: 2,
    name: '藥妝',
    message: '想買保養品，有藥妝嗎？',
    expected: { intent: 'MEDICAL', subcategory: '藥妝' }
  },
  {
    id: 3,
    name: '診所',
    message: '附近有內科診所嗎？',
    expected: { intent: 'MEDICAL', subcategory: '診所' }
  },
  {
    id: 4,
    name: '牙醫',
    message: '找牙醫，想洗牙',
    expected: { intent: 'MEDICAL', subcategory: '牙醫' }
  },
  {
    id: 5,
    name: '品牌偵測（屈臣氏）',
    message: '屈臣氏在哪',
    expected: { intent: 'MEDICAL' }
  },
  {
    id: 6,
    name: '食物（回歸）',
    message: '推薦日式料理',
    expected: { intent: 'FOOD' }
  },
  {
    id: 7,
    name: '停車（回歸）',
    message: '哪裡可以停車？',
    expected: { intent: 'PARKING' }
  },
  {
    id: 8,
    name: '覆蓋統計',
    message: '你的商家資料有多少資料?',
    expected: { intent: 'COVERAGE_STATS' }
  }
];

async function testCase(testCaseItem) {
  try {
    console.log(`\n🧪 測試 ${testCaseItem.id}: ${testCaseItem.name}`);
    console.log(`📝 輸入: "${testCaseItem.message}"`);
    
    const response = await fetch(EDGE_URL, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        session_id: `test-${testCaseItem.id}`,
        message: { content: testCaseItem.message }
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
      console.log(`📊 統計數據: ${data.response}`);
    }
    
    if (data.recommended_stores && data.recommended_stores.length > 0) {
      console.log(`🏪 推薦商家數: ${data.recommended_stores.length}`);
      if (data.recommended_stores.length <= 3) {
        console.log(`🏪 商家列表: ${data.recommended_stores.map(s => s.store_name).join(', ')}`);
      }
    }
    
    // 驗收檢查
    const intentMatch = data.intent === testCaseItem.expected.intent;
    const subcategoryMatch = !testCaseItem.expected.subcategory || data.recommendation_logic?.subcategory === testCaseItem.expected.subcategory;
    
    if (intentMatch && subcategoryMatch) {
      console.log(`✅ 測試通過`);
    } else {
      console.log(`❌ 測試失敗`);
      if (!intentMatch) console.log(`   - 意圖不匹配: 期望 ${testCaseItem.expected.intent}, 實際 ${data.intent}`);
      if (!subcategoryMatch) console.log(`   - 子分類不匹配: 期望 ${testCaseItem.expected.subcategory}, 實際 ${data.recommendation_logic?.subcategory}`);
    }
    
    return { testCase: testCaseItem, result, passed: intentMatch && subcategoryMatch };
    
  } catch (error) {
    console.error(`❌ 測試失敗: ${error.message}`);
    return { testCase: testCaseItem, error, passed: false };
  }
}

async function runAllTests() {
  console.log('🚀 開始 MEDICAL 子分類與統計修復驗收測試（8/8）');
  console.log('====================================================');
  
  const results = [];
  
  for (const testCaseItem of testCases) {
    const result = await testCase(testCaseItem);
    results.push(result);
    
    // 等待 1 秒避免請求過快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 統計結果
  console.log('\n📊 測試結果統計');
  console.log('================');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log(`✅ 通過: ${passed}/${total}`);
  console.log(`❌ 失敗: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 所有測試通過！MEDICAL 子分類與統計修復成功！');
  } else {
    console.log('\n⚠️ 部分測試失敗，請檢查 Edge Function 部署狀態');
  }
  
  // 詳細結果
  console.log('\n📋 詳細結果:');
  results.forEach(r => {
    const status = r.passed ? '✅' : '❌';
    console.log(`${status} ${r.testCase.name}: ${r.passed ? '通過' : '失敗'}`);
  });
}

// 執行測試
runAllTests().catch(console.error);
