/**
 * WEN 1.1.6 完整系統測試腳本
 */

const SMART_ACTION_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/smart-action';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

// 測試用例配置
const testScenarios = [
  {
    category: '美食推薦',
    tests: [
      { name: '基本美食查詢', message: '有什麼美食推薦？', expectedIntent: 'FOOD' },
      { name: '餐廳查詢', message: '附近有什麼餐廳？', expectedIntent: 'FOOD' },
      { name: '小吃查詢', message: '有什麼小吃推薦？', expectedIntent: 'FOOD' }
    ]
  },
  {
    category: '英語學習',
    tests: [
      { name: '基本英語學習', message: '我想學英語', expectedIntent: 'ENGLISH_LEARNING' },
      { name: '美語查詢', message: '有什麼美語補習班？', expectedIntent: 'ENGLISH_LEARNING' },
      { name: '英語追問', message: '我想學英語，還有其他選擇嗎？', expectedIntent: 'ENGLISH_LEARNING' }
    ]
  },
  {
    category: '停車場查詢',
    tests: [
      { name: '停車場查詢', message: '附近有停車場嗎？', expectedIntent: 'PARKING' },
      { name: '車位查詢', message: '哪裡可以停車？', expectedIntent: 'PARKING' }
    ]
  },
  {
    category: '一般查詢',
    tests: [
      { name: '一般推薦', message: '文山特區有什麼好玩的？', expectedIntent: 'GENERAL' },
      { name: '附近查詢', message: '附近有什麼推薦的？', expectedIntent: 'GENERAL' }
    ]
  }
];

async function testEdgeFunction() {
  console.log('🧪 WEN 1.1.6 Edge Function 測試開始\n');
  console.log(`🔗 URL: ${SMART_ACTION_URL}\n`);

  let totalTests = 0;
  let passedTests = 0;
  const testResults = [];

  for (const category of testScenarios) {
    console.log(`📋 測試類別: ${category.category}`);
    console.log('─'.repeat(50));

    for (const test of category.tests) {
      totalTests++;
      console.log(`\n🔍 測試: ${test.name}`);
      console.log(`💬 訊息: "${test.message}"`);

      try {
        const testMessage = {
          session_id: `test-session-${Date.now()}-${totalTests}`,
          message: {
            role: 'user',
            content: test.message
          },
          user_meta: {
            external_id: 'test-user',
            display_name: '測試用戶',
            avatar_url: ''
          }
        };

        const response = await fetch(SMART_ACTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify(testMessage)
        });

        if (response.ok) {
          const data = await response.json();
          
          // 檢查回應格式
          const hasResponse = !!data.response;
          const hasSessionId = !!data.session_id;
          const hasIntent = !!data.intent;
          const hasRecommendedStores = Array.isArray(data.recommended_stores);
          const hasVersion = !!data.version;

          console.log(`📊 狀態: ✅ 成功`);
          console.log(`🎯 意圖: ${data.intent || '未知'}`);
          console.log(`🏪 推薦商家: ${data.recommended_stores?.length || 0} 家`);
          console.log(`🔧 版本: ${data.version || '未知'}`);
          console.log(`🤖 回應長度: ${data.response?.length || 0} 字`);

          // 驗證意圖分類
          const intentCorrect = data.intent === test.expectedIntent;
          if (intentCorrect) {
            console.log(`✅ 意圖分類正確`);
          } else {
            console.log(`⚠️ 意圖分類不符預期 (預期: ${test.expectedIntent}, 實際: ${data.intent})`);
          }

          // 檢查回應品質
          const responseQuality = data.response && data.response.length > 20;
          if (responseQuality) {
            console.log(`✅ 回應品質良好`);
          } else {
            console.log(`⚠️ 回應品質需要改善`);
          }

          // 記錄測試結果
          const testResult = {
            name: test.name,
            category: category.category,
            message: test.message,
            expectedIntent: test.expectedIntent,
            actualIntent: data.intent,
            intentCorrect,
            responseLength: data.response?.length || 0,
            storeCount: data.recommended_stores?.length || 0,
            version: data.version,
            hasAllFields: hasResponse && hasSessionId && hasIntent && hasRecommendedStores && hasVersion,
            success: response.ok && intentCorrect && responseQuality
          };

          testResults.push(testResult);

          if (testResult.success) {
            passedTests++;
            console.log(`✅ 測試通過`);
          } else {
            console.log(`❌ 測試失敗`);
          }

        } else {
          const errorText = await response.text();
          console.log(`❌ 請求失敗: ${response.status} ${response.statusText}`);
          console.log(`   錯誤: ${errorText}`);

          testResults.push({
            name: test.name,
            category: category.category,
            message: test.message,
            success: false,
            error: `${response.status}: ${errorText}`
          });
        }

      } catch (error) {
        console.log(`❌ 測試異常: ${error.message}`);
        testResults.push({
          name: test.name,
          category: category.category,
          message: test.message,
          success: false,
          error: error.message
        });
      }

      console.log('─'.repeat(30));
    }
  }

  return { totalTests, passedTests, testResults };
}

async function testAdminBackend() {
  console.log('\n🔧 測試管理後台功能\n');

  const adminTests = [
    {
      name: '版本管理頁面',
      url: 'https://ai.linefans.cc/admin/version',
      description: '檢查版本管理頁面是否正常顯示'
    },
    {
      name: '對話記錄頁面',
      url: 'https://ai.linefans.cc/admin/conversations',
      description: '檢查對話記錄頁面是否正常顯示'
    },
    {
      name: '商家管理頁面',
      url: 'https://ai.linefans.cc/admin/stores',
      description: '檢查商家管理頁面是否正常顯示'
    }
  ];

  console.log('📋 管理後台測試清單:');
  adminTests.forEach((test, index) => {
    console.log(`${index + 1}. ${test.name}: ${test.url}`);
    console.log(`   ${test.description}`);
  });

  console.log('\n⚠️ 注意: 管理後台需要手動測試，請訪問上述 URL 確認功能正常');
  
  return adminTests;
}

async function generateTestReport(edgeFunctionResults, adminTests) {
  console.log('\n📊 WEN 1.1.6 完整系統測試報告');
  console.log('='.repeat(60));

  // Edge Function 測試結果
  console.log('\n🔧 Edge Function 測試結果:');
  console.log(`✅ 通過: ${edgeFunctionResults.passedTests}/${edgeFunctionResults.totalTests}`);
  console.log(`❌ 失敗: ${edgeFunctionResults.totalTests - edgeFunctionResults.passedTests}/${edgeFunctionResults.totalTests}`);
  console.log(`📈 成功率: ${((edgeFunctionResults.passedTests / edgeFunctionResults.totalTests) * 100).toFixed(1)}%`);

  // 分類統計
  const categoryStats = {};
  edgeFunctionResults.testResults.forEach(result => {
    if (!categoryStats[result.category]) {
      categoryStats[result.category] = { total: 0, passed: 0 };
    }
    categoryStats[result.category].total++;
    if (result.success) {
      categoryStats[result.category].passed++;
    }
  });

  console.log('\n📋 分類測試結果:');
  Object.entries(categoryStats).forEach(([category, stats]) => {
    const rate = ((stats.passed / stats.total) * 100).toFixed(1);
    console.log(`   ${category}: ${stats.passed}/${stats.total} (${rate}%)`);
  });

  // 失敗測試詳情
  const failedTests = edgeFunctionResults.testResults.filter(r => !r.success);
  if (failedTests.length > 0) {
    console.log('\n❌ 失敗測試詳情:');
    failedTests.forEach(test => {
      console.log(`   ${test.category} - ${test.name}: ${test.error || '測試失敗'}`);
    });
  }

  // 管理後台測試
  console.log('\n🔧 管理後台測試:');
  console.log('   需要手動測試以下頁面:');
  adminTests.forEach(test => {
    console.log(`   - ${test.name}: ${test.url}`);
  });

  // 總結
  console.log('\n🎯 測試總結:');
  if (edgeFunctionResults.passedTests === edgeFunctionResults.totalTests) {
    console.log('✅ WEN 1.1.6 系統測試全部通過！');
    console.log('🚀 系統已準備好投入生產使用');
  } else if (edgeFunctionResults.passedTests > edgeFunctionResults.totalTests * 0.8) {
    console.log('⚠️ WEN 1.1.6 系統測試大部分通過，建議修復失敗的測試案例');
  } else {
    console.log('❌ WEN 1.1.6 系統測試存在重大問題，需要立即修復');
  }

  console.log('\n📝 建議:');
  console.log('1. 修復失敗的測試案例');
  console.log('2. 手動測試管理後台功能');
  console.log('3. 進行用戶體驗測試');
  console.log('4. 監控系統性能指標');

  return {
    edgeFunctionResults,
    adminTests,
    summary: {
      totalTests: edgeFunctionResults.totalTests,
      passedTests: edgeFunctionResults.passedTests,
      successRate: (edgeFunctionResults.passedTests / edgeFunctionResults.totalTests) * 100,
      status: edgeFunctionResults.passedTests === edgeFunctionResults.totalTests ? 'PASS' : 'PARTIAL'
    }
  };
}

async function runComprehensiveTest() {
  console.log('🚀 WEN 1.1.6 完整系統測試開始\n');
  console.log('📅 測試時間:', new Date().toLocaleString());
  console.log('🔧 測試版本: WEN 1.1.6');
  console.log('🌐 測試環境: Production\n');

  try {
    // 1. Edge Function 測試
    const edgeFunctionResults = await testEdgeFunction();

    // 2. 管理後台測試
    const adminTests = await testAdminBackend();

    // 3. 生成測試報告
    const report = await generateTestReport(edgeFunctionResults, adminTests);

    console.log('\n🎉 測試完成！');
    return report;

  } catch (error) {
    console.error('\n❌ 測試執行失敗:', error.message);
    throw error;
  }
}

// 執行測試
runComprehensiveTest().catch(console.error);
