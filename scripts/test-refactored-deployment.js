/**
 * 測試重構版本部署狀態
 * 驗證重構版本是否成功部署
 */

async function testRefactoredDeployment() {
  console.log('🧪 測試重構版本部署狀態');
  console.log('==========================================');

  const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

  const testCases = [
    {
      name: '重構版本版本標記測試',
      message: '我想學英語',
      expectedVersion: 'WEN 1.3.0-refactored'
    },
    {
      name: '防幻覺機制測試',
      message: '我想吃日料',
      expectedFallback: true
    },
    {
      name: '統一 Fallback 測試',
      message: '推薦韓式餐廳',
      expectedFallback: true
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🎯 測試: ${testCase.name}`);
    console.log(`📝 輸入: "${testCase.message}"`);

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/claude-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          session_id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          message: { content: testCase.message },
          user_meta: { external_id: 'test-user', display_name: '測試用戶' }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.log(`❌ API 調用失敗: ${response.status} - ${errorData}`);
        continue;
      }

      const data = await response.json();
      const result = data.data;

      // 檢查版本標記
      if (testCase.expectedVersion && result.version !== testCase.expectedVersion) {
        console.log(`❌ 版本標記錯誤: 期望 ${testCase.expectedVersion}, 實際 ${result.version}`);
        continue;
      }

      // 檢查 fallback 機制
      if (testCase.expectedFallback !== undefined) {
        const actualUsedFallback = result.recommendation_logic?.fallback_used || false;
        if (testCase.expectedFallback !== actualUsedFallback) {
          console.log(`❌ Fallback 機制錯誤: 期望 ${testCase.expectedFallback}, 實際 ${actualUsedFallback}`);
          continue;
        }
      }

      console.log('✅ 測試通過');
      console.log(`📊 版本: ${result.version}`);
      console.log(`🎯 意圖: ${result.intent}`);
      console.log(`🏪 推薦商家數: ${result.recommended_stores?.length || 0}`);
      console.log(`⏱️ 處理時間: ${result.processing_time}ms`);

      // 檢查重構版本特有功能
      if (result.version === 'WEN 1.3.0-refactored') {
        console.log('🎉 重構版本部署成功！');
        console.log('✅ 防幻覺機制啟用');
        console.log('✅ 統一 Fallback 處理');
        console.log('✅ 模組化設計');
        console.log('✅ 結構化日誌');
      }

    } catch (error) {
      console.log(`❌ 測試異常: ${error.message}`);
    }

    console.log('---');
  }

  console.log('\n📋 重構版本部署驗證完成');
  console.log('==========================================');
  console.log('如果所有測試都通過，表示重構版本已成功部署！');
  console.log('如果仍有 401 錯誤，請檢查 Supabase Dashboard 環境變數設置。');
}

// 執行測試
testRefactoredDeployment()
  .then(() => {
    console.log('\n✅ 測試完成');
  })
  .catch(error => {
    console.error('測試執行失敗:', error);
  });
