/**
 * 嚴格驗收標準測試腳本
 * 測試語氣靈檢察官的驗收標準：
 * 0 幻覺：提到的資料必須存在於 DB 或 FAQ
 * 0 禁詞：未授權補習班絕對不出現
 * 100% 語氣合格：輸出保留高文文的人格
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// 嚴格驗收標準測試案例
const STRICT_VALIDATION_TEST_CASES = [
  // 標準 1: 0 幻覺測試
  {
    category: '0 幻覺檢查',
    name: '正常商家推薦',
    message: '有什麼美食推薦？',
    originalResponse: '我推薦肯塔基美語，這是一家專業的英語教學機構。',
    expectedStandards: {
      zeroHallucination: true,
      zeroForbiddenWords: true,
      toneQualification: true
    },
    description: '推薦真實存在的商家，應該通過所有標準'
  },
  {
    category: '0 幻覺檢查',
    name: '幻覺商家檢測',
    message: '推薦一些餐廳',
    originalResponse: '嘿～這附近我蠻推薦的餐廳有：鳳山牛肉麵、山城小館、Coz Pizza',
    expectedStandards: {
      zeroHallucination: false,
      zeroForbiddenWords: true,
      toneQualification: false
    },
    description: '包含幻覺商家，應該被檢測並修正'
  },
  {
    category: '0 幻覺檢查',
    name: '空資料處理',
    message: '有什麼美食推薦？',
    originalResponse: '我推薦鳳山牛肉麵，但目前沒有找到相關商家',
    expectedStandards: {
      zeroHallucination: false,
      zeroForbiddenWords: true,
      toneQualification: false
    },
    description: '邏輯矛盾：既推薦又說沒有找到，應該被修正'
  },

  // 標準 2: 0 禁詞測試
  {
    category: '0 禁詞檢查',
    name: '未授權補習班檢測',
    message: '我想學英語',
    originalResponse: '我推薦英文達人補習班，這是一家很好的英語教學機構。',
    expectedStandards: {
      zeroHallucination: true,
      zeroForbiddenWords: false,
      toneQualification: true
    },
    description: '包含未授權補習班，應該被檢測並修正'
  },
  {
    category: '0 禁詞檢查',
    name: '授權補習班推薦',
    message: '我想學英語',
    originalResponse: '我推薦肯塔基美語，這是一家專業的英語教學機構。',
    expectedStandards: {
      zeroHallucination: true,
      zeroForbiddenWords: true,
      toneQualification: true
    },
    description: '推薦授權補習班，應該通過所有標準'
  },
  {
    category: '0 禁詞檢查',
    name: '多個未授權補習班',
    message: '有什麼英語學習推薦？',
    originalResponse: '我推薦英文達人、環球英語、東門市場，這些都是很好的選擇。',
    expectedStandards: {
      zeroHallucination: true,
      zeroForbiddenWords: false,
      toneQualification: true
    },
    description: '包含多個未授權補習班，應該被檢測並修正'
  },

  // 標準 3: 100% 語氣合格測試
  {
    category: '100% 語氣合格檢查',
    name: '正常語氣',
    message: '有什麼推薦？',
    originalResponse: '讓我為您推薦一些不錯的選擇，這些都是文山特區值得信賴的商家。',
    expectedStandards: {
      zeroHallucination: true,
      zeroForbiddenWords: true,
      toneQualification: true
    },
    description: '使用正常的語氣，應該通過語氣檢查'
  },
  {
    category: '100% 語氣合格檢查',
    name: '禁止語氣模式',
    message: '有什麼推薦？',
    originalResponse: '嘿～這附近我蠻推薦的，我超推薦這些店家的啦！',
    expectedStandards: {
      zeroHallucination: true,
      zeroForbiddenWords: true,
      toneQualification: false
    },
    description: '包含禁止的語氣模式，應該被修正'
  },
  {
    category: '100% 語氣合格檢查',
    name: '缺乏人格特徵',
    message: '有什麼推薦？',
    originalResponse: '推薦。',
    expectedStandards: {
      zeroHallucination: true,
      zeroForbiddenWords: true,
      toneQualification: false
    },
    description: '回應過短，缺乏人格特徵，應該被修正'
  },
  {
    category: '100% 語氣合格檢查',
    name: '客服腔調',
    message: '有什麼推薦？',
    originalResponse: '您好，根據您的需求，我為您推薦以下商家。',
    expectedStandards: {
      zeroHallucination: true,
      zeroForbiddenWords: true,
      toneQualification: false
    },
    description: '使用客服腔調，不符合高文文人格，應該被修正'
  },

  // 綜合測試
  {
    category: '綜合測試',
    name: '完美通過案例',
    message: '我想學英語',
    originalResponse: '關於英語學習，我推薦肯塔基美語，這是一家專業的英語教學機構，相信對您的學習會有幫助。',
    expectedStandards: {
      zeroHallucination: true,
      zeroForbiddenWords: true,
      toneQualification: true
    },
    description: '完美的回應，應該通過所有標準'
  },
  {
    category: '綜合測試',
    name: '多重問題案例',
    message: '推薦一些餐廳',
    originalResponse: '嘿～這附近我蠻推薦的餐廳有：鳳山牛肉麵、英文達人補習班，我超推薦這些店家的啦！',
    expectedStandards: {
      zeroHallucination: false,
      zeroForbiddenWords: false,
      toneQualification: false
    },
    description: '包含多個問題：幻覺商家、未授權補習班、禁止語氣模式'
  }
];

// 測試結果
let testResults = [];

/**
 * 執行單個測試案例
 */
async function runStrictValidationTestCase(testCase) {
  console.log(`\n🧪 測試: ${testCase.name}`);
  console.log(`📋 類別: ${testCase.category}`);
  console.log(`📝 描述: ${testCase.description}`);
  console.log(`💬 用戶訊息: ${testCase.message}`);
  console.log(`🤖 原始回應: ${testCase.originalResponse}`);

  try {
    // 構建請求
    const requestBody = {
      session_id: `test-${Date.now()}`,
      message: { content: testCase.message },
      user_meta: { test_case: testCase.name },
      original_response: testCase.originalResponse
    };

    // 發送請求到語氣靈檢察官
    const response = await fetch(`${SUPABASE_URL}/functions/v1/tone-spirit-prosecutor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    // 分析結果
    const prosecutor = result.prosecutor;
    const actualStandards = prosecutor?.strictStandards || {};
    const passed = prosecutor?.passed || false;
    const corrections = prosecutor?.corrections || [];
    
    console.log(`✅ 檢察官通過: ${passed}`);
    console.log(`🔍 標準檢查結果:`);
    console.log(`   0 幻覺: ${actualStandards.zeroHallucination ? '✅' : '❌'}`);
    console.log(`   0 禁詞: ${actualStandards.zeroForbiddenWords ? '✅' : '❌'}`);
    console.log(`   100% 語氣合格: ${actualStandards.toneQualification ? '✅' : '❌'}`);
    console.log(`🔧 修正項目: ${corrections.length} 個`);
    console.log(`📤 最終回應: ${result.response}`);

    // 檢查結果
    const standardsMatch = Object.keys(testCase.expectedStandards).every(standard => 
      actualStandards[standard] === testCase.expectedStandards[standard]
    );
    
    const testResult = {
      name: testCase.name,
      category: testCase.category,
      status: standardsMatch ? 'PASSED' : 'FAILED',
      expected: testCase.expectedStandards,
      actual: actualStandards,
      passed: passed,
      corrections: corrections,
      finalResponse: result.response,
      prosecutor: prosecutor,
      error: null
    };

    if (testResult.status === 'PASSED') {
      console.log(`🎉 測試通過！`);
    } else {
      console.log(`❌ 測試失敗！`);
      Object.keys(testCase.expectedStandards).forEach(standard => {
        const expected = testCase.expectedStandards[standard];
        const actual = actualStandards[standard];
        if (expected !== actual) {
          console.log(`   ${standard}: 預期 ${expected}, 實際 ${actual}`);
        }
      });
    }

    return testResult;

  } catch (error) {
    console.error(`💥 測試異常: ${error.message}`);
    
    return {
      name: testCase.name,
      category: testCase.category,
      status: 'ERROR',
      expected: testCase.expectedStandards,
      actual: {},
      passed: false,
      corrections: [],
      finalResponse: null,
      prosecutor: null,
      error: error.message
    };
  }
}

/**
 * 執行所有測試案例
 */
async function runAllStrictValidationTests() {
  console.log('🚀 開始執行嚴格驗收標準測試');
  console.log(`📊 總測試案例數: ${STRICT_VALIDATION_TEST_CASES.length}`);
  
  const startTime = Date.now();
  
  for (const testCase of STRICT_VALIDATION_TEST_CASES) {
    const result = await runStrictValidationTestCase(testCase);
    testResults.push(result);
    
    // 測試間隔
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // 生成測試報告
  generateStrictValidationTestReport(duration);
}

/**
 * 生成嚴格驗收標準測試報告
 */
function generateStrictValidationTestReport(duration) {
  console.log('\n📋 嚴格驗收標準測試報告');
  console.log('='.repeat(60));
  
  const passedTests = testResults.filter(r => r.status === 'PASSED').length;
  const failedTests = testResults.filter(r => r.status === 'FAILED').length;
  const errorTests = testResults.filter(r => r.status === 'ERROR').length;
  
  console.log(`📊 測試統計:`);
  console.log(`   總數: ${testResults.length}`);
  console.log(`   通過: ${passedTests} (${Math.round(passedTests/testResults.length*100)}%)`);
  console.log(`   失敗: ${failedTests} (${Math.round(failedTests/testResults.length*100)}%)`);
  console.log(`   錯誤: ${errorTests} (${Math.round(errorTests/testResults.length*100)}%)`);
  console.log(`   耗時: ${duration}ms`);
  
  // 按類別統計
  const categoryStats = {};
  testResults.forEach(result => {
    if (!categoryStats[result.category]) {
      categoryStats[result.category] = { total: 0, passed: 0, failed: 0, error: 0 };
    }
    categoryStats[result.category].total++;
    categoryStats[result.category][result.status.toLowerCase()]++;
  });
  
  console.log(`\n📈 按類別統計:`);
  Object.entries(categoryStats).forEach(([category, stats]) => {
    const passRate = Math.round((stats.passed / stats.total) * 100);
    console.log(`   ${category}: ${stats.passed}/${stats.total} (${passRate}%)`);
  });
  
  // 標準檢查統計
  const standardStats = {
    zeroHallucination: { total: 0, passed: 0 },
    zeroForbiddenWords: { total: 0, passed: 0 },
    toneQualification: { total: 0, passed: 0 }
  };
  
  testResults.forEach(result => {
    if (result.actual) {
      Object.keys(standardStats).forEach(standard => {
        standardStats[standard].total++;
        if (result.actual[standard] === true) {
          standardStats[standard].passed++;
        }
      });
    }
  });
  
  console.log(`\n🎯 標準檢查統計:`);
  Object.entries(standardStats).forEach(([standard, stats]) => {
    const passRate = Math.round((stats.passed / stats.total) * 100);
    console.log(`   ${standard}: ${stats.passed}/${stats.total} (${passRate}%)`);
  });
  
  // 詳細結果
  console.log(`\n📝 詳細結果:`);
  testResults.forEach((result, index) => {
    const statusIcon = result.status === 'PASSED' ? '✅' : result.status === 'FAILED' ? '❌' : '💥';
    console.log(`${statusIcon} ${index + 1}. ${result.name} (${result.category})`);
    
    if (result.status === 'FAILED') {
      Object.keys(result.expected).forEach(standard => {
        const expected = result.expected[standard];
        const actual = result.actual[standard];
        if (expected !== actual) {
          console.log(`     ${standard}: 預期 ${expected}, 實際 ${actual}`);
        }
      });
    }
    
    if (result.status === 'ERROR') {
      console.log(`     錯誤: ${result.error}`);
    }
  });
  
  // 檢察官效能分析
  console.log(`\n🔍 檢察官效能分析:`);
  const prosecutorResults = testResults.filter(r => r.prosecutor).map(r => r.prosecutor);
  
  if (prosecutorResults.length > 0) {
    const totalCorrections = prosecutorResults.reduce((sum, p) => sum + (p.corrections?.length || 0), 0);
    const averageCorrections = totalCorrections / prosecutorResults.length;
    const passedCount = prosecutorResults.filter(p => p.passed).length;
    
    console.log(`   總通過率: ${Math.round((passedCount / prosecutorResults.length) * 100)}%`);
    console.log(`   平均修正數: ${averageCorrections.toFixed(2)}`);
    console.log(`   總修正數: ${totalCorrections}`);
    
    // 常見修正類型
    const correctionTypes = {};
    prosecutorResults.forEach(p => {
      if (p.corrections) {
        p.corrections.forEach(correction => {
          const type = correction.description.split(':')[0] || 'Unknown';
          correctionTypes[type] = (correctionTypes[type] || 0) + 1;
        });
      }
    });
    
    if (Object.keys(correctionTypes).length > 0) {
      console.log(`   常見修正類型:`);
      Object.entries(correctionTypes)
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, count]) => {
          console.log(`     ${type}: ${count} 次`);
        });
    }
  }
  
  // 總結
  console.log(`\n🎯 總結:`);
  if (passedTests === testResults.length) {
    console.log(`🎉 所有測試通過！語氣靈檢察官嚴格驗收標準運作正常。`);
  } else if (failedTests > 0) {
    console.log(`⚠️ 發現 ${failedTests} 個測試失敗，需要檢查檢察官邏輯。`);
  } else if (errorTests > 0) {
    console.log(`💥 發現 ${errorTests} 個測試錯誤，需要檢查系統連通性。`);
  }
  
  // 建議
  console.log(`\n💡 建議:`);
  if (failedTests > 0) {
    console.log(`   - 檢查檢察官驗收標準邏輯`);
    console.log(`   - 驗證黑名單和禁詞設定`);
    console.log(`   - 調整語氣合格檢查規則`);
  }
  
  if (errorTests > 0) {
    console.log(`   - 檢查 Edge Function 部署狀態`);
    console.log(`   - 驗證環境變數設定`);
    console.log(`   - 檢查網路連通性`);
  }
  
  if (passedTests === testResults.length) {
    console.log(`   - 檢察官運作正常，可以部署到生產環境`);
    console.log(`   - 建議定期執行測試以確保檢察官穩定性`);
    console.log(`   - 可以考慮擴展到信任層架構`);
  }
}

/**
 * 主函數
 */
async function main() {
  try {
    await runAllStrictValidationTests();
  } catch (error) {
    console.error('測試執行失敗:', error);
    process.exit(1);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  main();
}

module.exports = {
  runAllStrictValidationTests,
  runStrictValidationTestCase,
  STRICT_VALIDATION_TEST_CASES
};
