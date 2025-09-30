/**
 * 允許清單架構測試腳本
 * 測試：允許清單（Allowlist）+ 資格規則（Eligibility）+ 贊助等級（Sponsorship Tier）+ 證據優先（Evidence-required）
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// 允許清單架構測試案例
const ALLOWLIST_TEST_CASES = [
  // 允許清單測試
  {
    category: '允許清單測試',
    name: '正常合格商家推薦',
    message: '有什麼美食推薦？',
    expectedLogic: {
      allowlistUsed: true,
      evidenceVerified: true,
      sponsorshipTierRanking: true,
      approvalStatus: 'approved'
    },
    description: '應該只推薦 approval=approved 的商家'
  },
  {
    category: '允許清單測試',
    name: '未審核商家不推薦',
    message: '推薦一些餐廳',
    originalResponse: '我推薦測試餐廳（未審核）',
    expectedLogic: {
      allowlistUsed: true,
      evidenceVerified: false,
      sponsorshipTierRanking: true,
      approvalStatus: 'pending'
    },
    description: '未審核的商家不應該出現在推薦中'
  },

  // 贊助等級測試
  {
    category: '贊助等級測試',
    name: '主推商家優先',
    message: '有什麼推薦？',
    expectedLogic: {
      allowlistUsed: true,
      evidenceVerified: true,
      sponsorshipTierRanking: true,
      tier2First: true
    },
    description: '主推商家（sponsorship_tier=2）應該優先顯示'
  },
  {
    category: '贊助等級測試',
    name: '特約商家次優先',
    message: '推薦一些商家',
    expectedLogic: {
      allowlistUsed: true,
      evidenceVerified: true,
      sponsorshipTierRanking: true,
      tier1Second: true
    },
    description: '特約商家（sponsorship_tier=1）應該次優先顯示'
  },

  // 證據優先測試
  {
    category: '證據優先測試',
    name: '已驗證商家優先',
    message: '有什麼推薦？',
    expectedLogic: {
      allowlistUsed: true,
      evidenceVerified: true,
      evidenceLevel: 'verified'
    },
    description: '已驗證的商家（evidence_level=verified）應該優先推薦'
  },
  {
    category: '證據優先測試',
    name: '未驗證商家不推薦',
    message: '推薦一些商家',
    originalResponse: '我推薦未驗證商家',
    expectedLogic: {
      allowlistUsed: true,
      evidenceVerified: false,
      evidenceLevel: 'unverified'
    },
    description: '未驗證的商家不應該出現在推薦中'
  },

  // 英語學習特殊處理測試
  {
    category: '英語學習特殊處理',
    name: '肯塔基美語必入列',
    message: '我想學英語',
    expectedLogic: {
      allowlistUsed: true,
      kentuckyIncluded: true,
      storeCode: 'kentucky',
      evidenceVerified: true
    },
    description: '英語學習意圖必須包含肯塔基美語（store_code=kentucky）'
  },
  {
    category: '英語學習特殊處理',
    name: '肯塔基補位機制',
    message: '我想學英語',
    expectedLogic: {
      allowlistUsed: true,
      kentuckyIncluded: true,
      autoInclude: true,
      evidenceVerified: true
    },
    description: '如果查詢結果沒有肯塔基，應該自動補入'
  },

  // 資格規則測試
  {
    category: '資格規則測試',
    name: '授權實體檢查',
    message: '我想學英語',
    expectedLogic: {
      allowlistUsed: true,
      authorizedEntities: ['肯塔基美語'],
      unauthorizedEntities: []
    },
    description: '只推薦授權的英語學習機構'
  },
  {
    category: '資格規則測試',
    name: '未授權實體過濾',
    message: '推薦英語學習機構',
    originalResponse: '我推薦英文達人、環球英語',
    expectedLogic: {
      allowlistUsed: true,
      unauthorizedEntities: ['英文達人', '環球英語'],
      filtered: true
    },
    description: '未授權的實體應該被過濾掉'
  },

  // 綜合測試
  {
    category: '綜合測試',
    name: '完美允許清單案例',
    message: '我想學英語',
    expectedLogic: {
      allowlistUsed: true,
      evidenceVerified: true,
      sponsorshipTierRanking: true,
      kentuckyIncluded: true,
      approvalStatus: 'approved',
      maxStores: 3
    },
    description: '完美的允許清單推薦案例'
  },
  {
    category: '綜合測試',
    name: '多重資格檢查',
    message: '推薦一些商家',
    expectedLogic: {
      allowlistUsed: true,
      evidenceVerified: true,
      sponsorshipTierRanking: true,
      approvalStatus: 'approved',
      eligibilityRules: true
    },
    description: '多重資格規則檢查'
  }
];

// 測試結果
let testResults = [];

/**
 * 執行單個測試案例
 */
async function runAllowlistTestCase(testCase) {
  console.log(`\n🧪 測試: ${testCase.name}`);
  console.log(`📋 類別: ${testCase.category}`);
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

    // 發送請求到允許清單推薦引擎
    const response = await fetch(`${SUPABASE_URL}/functions/v1/allowlist-recommendation`, {
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
    const recommendationLogic = result.recommendation_logic || {};
    const recommendedStores = result.recommended_stores || [];
    
    console.log(`✅ 推薦引擎: ${result.version}`);
    console.log(`🎯 意圖: ${result.intent}`);
    console.log(`🏪 推薦商家: ${recommendedStores.length} 家`);
    console.log(`🔍 推薦邏輯:`);
    console.log(`   允許清單: ${recommendationLogic.allowlist_used ? '✅' : '❌'}`);
    console.log(`   證據驗證: ${recommendationLogic.evidence_verified ? '✅' : '❌'}`);
    console.log(`   贊助等級排序: ${recommendationLogic.sponsorship_tier_ranking ? '✅' : '❌'}`);
    console.log(`   肯塔基包含: ${recommendationLogic.kentucky_included ? '✅' : '❌'}`);
    console.log(`📤 最終回應: ${result.response}`);

    // 檢查結果
    const logicMatch = Object.keys(testCase.expectedLogic).every(key => {
      const expected = testCase.expectedLogic[key];
      const actual = recommendationLogic[key];
      return actual === expected;
    });
    
    const testResult = {
      name: testCase.name,
      category: testCase.category,
      status: logicMatch ? 'PASSED' : 'FAILED',
      expected: testCase.expectedLogic,
      actual: recommendationLogic,
      recommendedStores: recommendedStores,
      response: result.response,
      error: null
    };

    if (testResult.status === 'PASSED') {
      console.log(`🎉 測試通過！`);
    } else {
      console.log(`❌ 測試失敗！`);
      Object.keys(testCase.expectedLogic).forEach(key => {
        const expected = testCase.expectedLogic[key];
        const actual = recommendationLogic[key];
        if (expected !== actual) {
          console.log(`   ${key}: 預期 ${expected}, 實際 ${actual}`);
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
      expected: testCase.expectedLogic,
      actual: {},
      recommendedStores: [],
      response: null,
      error: error.message
    };
  }
}

/**
 * 執行所有測試案例
 */
async function runAllAllowlistTests() {
  console.log('🚀 開始執行允許清單架構測試');
  console.log(`📊 總測試案例數: ${ALLOWLIST_TEST_CASES.length}`);
  
  const startTime = Date.now();
  
  for (const testCase of ALLOWLIST_TEST_CASES) {
    const result = await runAllowlistTestCase(testCase);
    testResults.push(result);
    
    // 測試間隔
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // 生成測試報告
  generateAllowlistTestReport(duration);
}

/**
 * 生成允許清單架構測試報告
 */
function generateAllowlistTestReport(duration) {
  console.log('\n📋 允許清單架構測試報告');
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
  
  // 推薦邏輯統計
  const logicStats = {
    allowlistUsed: { total: 0, passed: 0 },
    evidenceVerified: { total: 0, passed: 0 },
    sponsorshipTierRanking: { total: 0, passed: 0 },
    kentuckyIncluded: { total: 0, passed: 0 }
  };
  
  testResults.forEach(result => {
    if (result.actual) {
      Object.keys(logicStats).forEach(logic => {
        logicStats[logic].total++;
        if (result.actual[logic] === true) {
          logicStats[logic].passed++;
        }
      });
    }
  });
  
  console.log(`\n🎯 推薦邏輯統計:`);
  Object.entries(logicStats).forEach(([logic, stats]) => {
    const passRate = Math.round((stats.passed / stats.total) * 100);
    console.log(`   ${logic}: ${stats.passed}/${stats.total} (${passRate}%)`);
  });
  
  // 詳細結果
  console.log(`\n📝 詳細結果:`);
  testResults.forEach((result, index) => {
    const statusIcon = result.status === 'PASSED' ? '✅' : result.status === 'FAILED' ? '❌' : '💥';
    console.log(`${statusIcon} ${index + 1}. ${result.name} (${result.category})`);
    
    if (result.status === 'FAILED') {
      Object.keys(result.expected).forEach(key => {
        const expected = result.expected[key];
        const actual = result.actual[key];
        if (expected !== actual) {
          console.log(`     ${key}: 預期 ${expected}, 實際 ${actual}`);
        }
      });
    }
    
    if (result.status === 'ERROR') {
      console.log(`     錯誤: ${result.error}`);
    }
  });
  
  // 允許清單效能分析
  console.log(`\n🔍 允許清單效能分析:`);
  const recommendationResults = testResults.filter(r => r.actual).map(r => r.actual);
  
  if (recommendationResults.length > 0) {
    const totalStores = testResults.reduce((sum, r) => sum + r.recommendedStores.length, 0);
    const averageStores = totalStores / testResults.length;
    const allowlistUsedCount = recommendationResults.filter(r => r.allowlist_used).length;
    const evidenceVerifiedCount = recommendationResults.filter(r => r.evidence_verified).length;
    
    console.log(`   允許清單使用率: ${Math.round((allowlistUsedCount / recommendationResults.length) * 100)}%`);
    console.log(`   證據驗證率: ${Math.round((evidenceVerifiedCount / recommendationResults.length) * 100)}%`);
    console.log(`   平均推薦商家數: ${averageStores.toFixed(2)}`);
    console.log(`   總推薦商家數: ${totalStores}`);
    
    // 贊助等級分析
    const tierStats = { tier0: 0, tier1: 0, tier2: 0 };
    testResults.forEach(result => {
      result.recommendedStores.forEach(store => {
        if (store.sponsorship_tier === 0) tierStats.tier0++;
        if (store.sponsorship_tier === 1) tierStats.tier1++;
        if (store.sponsorship_tier === 2) tierStats.tier2++;
      });
    });
    
    console.log(`   贊助等級分佈:`);
    console.log(`     主推商家(tier2): ${tierStats.tier2}`);
    console.log(`     特約商家(tier1): ${tierStats.tier1}`);
    console.log(`     一般商家(tier0): ${tierStats.tier0}`);
  }
  
  // 總結
  console.log(`\n🎯 總結:`);
  if (passedTests === testResults.length) {
    console.log(`🎉 所有測試通過！允許清單架構運作正常。`);
  } else if (failedTests > 0) {
    console.log(`⚠️ 發現 ${failedTests} 個測試失敗，需要檢查允許清單邏輯。`);
  } else if (errorTests > 0) {
    console.log(`💥 發現 ${errorTests} 個測試錯誤，需要檢查系統連通性。`);
  }
  
  // 建議
  console.log(`\n💡 建議:`);
  if (failedTests > 0) {
    console.log(`   - 檢查允許清單查詢邏輯`);
    console.log(`   - 驗證審核狀態設定`);
    console.log(`   - 調整贊助等級排序`);
    console.log(`   - 確認證據驗證機制`);
  }
  
  if (errorTests > 0) {
    console.log(`   - 檢查 Edge Function 部署狀態`);
    console.log(`   - 驗證環境變數設定`);
    console.log(`   - 檢查網路連通性`);
  }
  
  if (passedTests === testResults.length) {
    console.log(`   - 允許清單架構運作正常，可以部署到生產環境`);
    console.log(`   - 建議定期執行測試以確保架構穩定性`);
    console.log(`   - 可以考慮擴展到信任層架構`);
  }
}

/**
 * 主函數
 */
async function main() {
  try {
    await runAllAllowlistTests();
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
  runAllAllowlistTests,
  runAllowlistTestCase,
  ALLOWLIST_TEST_CASES
};
