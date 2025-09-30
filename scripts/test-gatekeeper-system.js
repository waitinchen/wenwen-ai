/**
 * 把關系統測試腳本
 * 測試五層架構管理師的各種場景
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// 測試案例
const TEST_CASES = [
  {
    name: '正常美食推薦',
    message: '有什麼美食推薦？',
    expectedStatus: 'PASSED',
    expectedCorrections: 0,
    description: '應該正常通過，推薦真實商家或告知沒有找到'
  },
  {
    name: '英語學習推薦',
    message: '我想學英語',
    expectedStatus: 'PASSED',
    expectedCorrections: 0,
    description: '應該推薦肯塔基美語或告知沒有找到'
  },
  {
    name: '停車場查詢',
    message: '附近有停車場嗎？',
    expectedStatus: 'PASSED',
    expectedCorrections: 0,
    description: '應該推薦真實停車場或告知沒有找到'
  },
  {
    name: '幻覺商家檢測',
    message: '推薦一些餐廳',
    originalResponse: '嘿～這附近我蠻推薦的餐廳有：鳳山牛肉麵、山城小館、Coz Pizza',
    expectedStatus: 'CORRECTED',
    expectedCorrections: 1,
    description: '應該檢測到幻覺商家並修正回應'
  },
  {
    name: '邏輯矛盾檢測',
    message: '有什麼美食推薦？',
    originalResponse: '我推薦鳳山牛肉麵，但目前沒有找到相關商家',
    expectedStatus: 'CORRECTED',
    expectedCorrections: 1,
    description: '應該檢測到邏輯矛盾並修正回應'
  },
  {
    name: '意圖不符檢測',
    message: '我想學英語',
    originalResponse: '我推薦鳳山牛肉麵，這家餐廳的英語教學很棒',
    expectedStatus: 'CORRECTED',
    expectedCorrections: 1,
    description: '應該檢測到回應與用戶意圖不符'
  },
  {
    name: '空回應檢測',
    message: '有什麼推薦？',
    originalResponse: '',
    expectedStatus: 'CORRECTED',
    expectedCorrections: 1,
    description: '應該檢測到空回應並修正'
  },
  {
    name: '安全檢查',
    message: '測試訊息',
    originalResponse: '抱歉，系統暫時無法回應，請稍後再試。',
    expectedStatus: 'PASSED',
    expectedCorrections: 0,
    description: '系統錯誤回應應該通過安全檢查'
  }
];

// 測試結果
let testResults = [];

/**
 * 執行單個測試案例
 */
async function runTestCase(testCase) {
  console.log(`\n🧪 測試: ${testCase.name}`);
  console.log(`📝 描述: ${testCase.description}`);
  console.log(`💬 用戶訊息: ${testCase.message}`);
  
  if (testCase.originalResponse) {
    console.log(`🤖 原始回應: ${testCase.originalResponse}`);
  }

  try {
    // 構建請求
    const requestBody = {
      session_id: `test-${Date.now()}`,
      message: { content: testCase.message },
      user_meta: { test_case: testCase.name }
    };

    if (testCase.originalResponse) {
      requestBody.original_response = testCase.originalResponse;
    }

    // 發送請求到把關系統
    const response = await fetch(`${SUPABASE_URL}/functions/v1/gatekeeper-integration`, {
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
    const actualStatus = result.gatekeeping?.status || 'UNKNOWN';
    const actualCorrections = result.gatekeeping?.corrections?.length || 0;
    
    console.log(`✅ 實際狀態: ${actualStatus}`);
    console.log(`🔧 修正數: ${actualCorrections}`);
    console.log(`📤 最終回應: ${result.response}`);

    // 檢查結果
    const statusMatch = actualStatus === testCase.expectedStatus;
    const correctionsMatch = actualCorrections === testCase.expectedCorrections;
    
    const testResult = {
      name: testCase.name,
      status: statusMatch && correctionsMatch ? 'PASSED' : 'FAILED',
      expected: {
        status: testCase.expectedStatus,
        corrections: testCase.expectedCorrections
      },
      actual: {
        status: actualStatus,
        corrections: actualCorrections
      },
      response: result.response,
      gatekeeping: result.gatekeeping,
      error: null
    };

    if (testResult.status === 'PASSED') {
      console.log(`🎉 測試通過！`);
    } else {
      console.log(`❌ 測試失敗！`);
      console.log(`   預期狀態: ${testCase.expectedStatus}, 實際: ${actualStatus}`);
      console.log(`   預期修正數: ${testCase.expectedCorrections}, 實際: ${actualCorrections}`);
    }

    return testResult;

  } catch (error) {
    console.error(`💥 測試異常: ${error.message}`);
    
    return {
      name: testCase.name,
      status: 'ERROR',
      expected: {
        status: testCase.expectedStatus,
        corrections: testCase.expectedCorrections
      },
      actual: {
        status: 'ERROR',
        corrections: 0
      },
      response: null,
      gatekeeping: null,
      error: error.message
    };
  }
}

/**
 * 執行所有測試案例
 */
async function runAllTests() {
  console.log('🚀 開始執行把關系統測試');
  console.log(`📊 總測試案例數: ${TEST_CASES.length}`);
  
  const startTime = Date.now();
  
  for (const testCase of TEST_CASES) {
    const result = await runTestCase(testCase);
    testResults.push(result);
    
    // 測試間隔
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // 生成測試報告
  generateTestReport(duration);
}

/**
 * 生成測試報告
 */
function generateTestReport(duration) {
  console.log('\n📋 測試報告');
  console.log('='.repeat(50));
  
  const passedTests = testResults.filter(r => r.status === 'PASSED').length;
  const failedTests = testResults.filter(r => r.status === 'FAILED').length;
  const errorTests = testResults.filter(r => r.status === 'ERROR').length;
  
  console.log(`📊 測試統計:`);
  console.log(`   總數: ${testResults.length}`);
  console.log(`   通過: ${passedTests} (${Math.round(passedTests/testResults.length*100)}%)`);
  console.log(`   失敗: ${failedTests} (${Math.round(failedTests/testResults.length*100)}%)`);
  console.log(`   錯誤: ${errorTests} (${Math.round(errorTests/testResults.length*100)}%)`);
  console.log(`   耗時: ${duration}ms`);
  
  // 詳細結果
  console.log(`\n📝 詳細結果:`);
  testResults.forEach((result, index) => {
    const statusIcon = result.status === 'PASSED' ? '✅' : result.status === 'FAILED' ? '❌' : '💥';
    console.log(`${statusIcon} ${index + 1}. ${result.name}`);
    
    if (result.status === 'FAILED') {
      console.log(`   預期: ${result.expected.status} (修正: ${result.expected.corrections})`);
      console.log(`   實際: ${result.actual.status} (修正: ${result.actual.corrections})`);
    }
    
    if (result.status === 'ERROR') {
      console.log(`   錯誤: ${result.error}`);
    }
  });
  
  // 把關系統效能分析
  console.log(`\n🔍 把關系統效能分析:`);
  const gatekeepingResults = testResults.filter(r => r.gatekeeping).map(r => r.gatekeeping);
  
  if (gatekeepingResults.length > 0) {
    const totalCorrections = gatekeepingResults.reduce((sum, g) => sum + (g.corrections?.length || 0), 0);
    const averageCorrections = totalCorrections / gatekeepingResults.length;
    
    console.log(`   平均修正數: ${averageCorrections.toFixed(2)}`);
    console.log(`   總修正數: ${totalCorrections}`);
    
    // 常見修正類型
    const correctionTypes = {};
    gatekeepingResults.forEach(g => {
      if (g.corrections) {
        g.corrections.forEach(correction => {
          const type = correction.split(':')[0] || 'Unknown';
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
    console.log(`🎉 所有測試通過！把關系統運作正常。`);
  } else if (failedTests > 0) {
    console.log(`⚠️ 發現 ${failedTests} 個測試失敗，需要檢查把關邏輯。`);
  } else if (errorTests > 0) {
    console.log(`💥 發現 ${errorTests} 個測試錯誤，需要檢查系統連通性。`);
  }
  
  // 建議
  console.log(`\n💡 建議:`);
  if (failedTests > 0) {
    console.log(`   - 檢查把關規則配置`);
    console.log(`   - 驗證黑名單設定`);
    console.log(`   - 調整閾值參數`);
  }
  
  if (errorTests > 0) {
    console.log(`   - 檢查 Edge Function 部署狀態`);
    console.log(`   - 驗證環境變數設定`);
    console.log(`   - 檢查網路連通性`);
  }
  
  if (passedTests === testResults.length) {
    console.log(`   - 系統運作正常，可以部署到生產環境`);
    console.log(`   - 建議定期執行測試以確保系統穩定性`);
  }
}

/**
 * 主函數
 */
async function main() {
  try {
    await runAllTests();
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
  runAllTests,
  runTestCase,
  TEST_CASES
};
