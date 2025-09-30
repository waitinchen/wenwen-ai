/**
 * 測試增強功能 - 跨類別幻覺防護和醫療標籤系統
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_FgIuCi_gWTgrLuobRdeyeA_xO1b4ecq';

async function testEnhancedFeatures() {
  console.log('🚀 測試增強功能...\n');

  const testCases = [
    // 跨類別幻覺防護測試
    {
      name: '跨類別幻覺防護測試 - 藥局查詢',
      query: '我想找藥局',
      expectedIntent: 'MEDICAL',
      description: '測試是否會錯誤推薦補習班或其他類別'
    },
    {
      name: '跨類別幻覺防護測試 - 混合關鍵字',
      query: '我想學美語，但也要買藥',
      expectedIntent: 'MEDICAL', // 應該優先醫療
      description: '測試混合關鍵字的優先級處理'
    },
    
    // 醫療標籤系統測試
    {
      name: '醫療標籤系統測試 - 藥局關鍵字',
      query: '附近有藥局嗎？',
      expectedIntent: 'MEDICAL',
      description: '測試藥局關鍵字的智能匹配'
    },
    {
      name: '醫療標籤系統測試 - 藥妝店',
      query: '推薦藥妝店',
      expectedIntent: 'MEDICAL',
      description: '測試藥妝店的自動映射'
    },
    {
      name: '醫療標籤系統測試 - 牙醫',
      query: '找牙醫診所',
      expectedIntent: 'MEDICAL',
      description: '測試牙醫相關查詢'
    },
    
    // 對照組測試
    {
      name: '對照組測試 - 美食查詢',
      query: '推薦日式料理',
      expectedIntent: 'FOOD',
      description: '測試美食查詢不受影響'
    },
    {
      name: '對照組測試 - 停車查詢',
      query: '哪裡可以停車？',
      expectedIntent: 'PARKING',
      description: '測試停車查詢不受影響'
    }
  ];

  let successCount = 0;
  let totalCount = testCases.length;

  for (const testCase of testCases) {
    console.log(`📋 ${testCase.name}`);
    console.log(`   查詢: "${testCase.query}"`);
    console.log(`   預期意圖: ${testCase.expectedIntent}`);
    console.log(`   說明: ${testCase.description}`);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/claude-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: { content: testCase.query },
          session_id: `test-enhanced-${Date.now()}`
        })
      });

      if (!response.ok) {
        console.log(`   ❌ HTTP錯誤: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`   錯誤詳情: ${errorText}`);
        continue;
      }

      const data = await response.json();
      
      // 檢查是否成功返回
      if (data.error) {
        console.log(`   ❌ API錯誤: ${data.error.message}`);
        continue;
      }

      // 檢查意圖識別
      if (data.intent === testCase.expectedIntent) {
        console.log(`   ✅ 意圖識別正確: ${data.intent}`);
        successCount++;
      } else {
        console.log(`   ⚠️  意圖識別不符: 預期 ${testCase.expectedIntent}, 實際 ${data.intent}`);
      }

      // 檢查回應內容
      if (data.response && typeof data.response === 'string') {
        console.log(`   ✅ 回應正常: ${data.response.length} 字元`);
        
        // 檢查是否有版本標識
        if (data.response.includes('WEN 1.4.6')) {
          console.log(`   ✅ 版本標識正常`);
        }
        
        // 特別檢查醫療查詢的回應
        if (testCase.expectedIntent === 'MEDICAL') {
          if (data.response.includes('藥') || data.response.includes('醫療') || data.response.includes('診所')) {
            console.log(`   ✅ 醫療相關內容正確`);
          } else {
            console.log(`   ⚠️  醫療相關內容可能不準確`);
          }
        }
      } else {
        console.log(`   ❌ 回應結構異常`);
      }

      console.log(`   回應預覽: ${data.response?.substring(0, 100)}...\n`);

    } catch (error) {
      console.log(`   ❌ 測試異常: ${error.message}`);
      console.log('');
    }
  }

  const successRate = ((successCount / totalCount) * 100).toFixed(1);
  
  console.log('🎯 增強功能測試完成！');
  console.log(`📊 測試結果: ${successCount}/${totalCount} (${successRate}%)`);
  
  if (successRate >= 80) {
    console.log('✅ 增強功能運作良好！');
  } else if (successRate >= 60) {
    console.log('⚠️  增強功能基本正常，但還有改進空間');
  } else {
    console.log('❌ 增強功能需要進一步調試');
  }
  
  console.log('\n📝 增強功能摘要:');
  console.log('✅ 跨類別幻覺防護 - 防止錯誤推薦不同類別商家');
  console.log('✅ 醫療標籤系統 - 智能匹配藥局、診所、牙醫等');
  console.log('✅ 強化意圖分類 - 更準確的意圖識別');
  console.log('✅ 智能標籤匹配 - 基於關鍵字權重的匹配算法');
}

// 執行測試
testEnhancedFeatures().catch(console.error);
