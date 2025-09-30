/**
 * 最終測試 smart-action Edge Function
 */

const SMART_ACTION_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/smart-action';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

async function testSmartActionFinal() {
  console.log('🧪 最終測試 smart-action Edge Function\n');
  console.log(`🔗 URL: ${SMART_ACTION_URL}\n`);

  const testCases = [
    {
      name: '美食推薦測試',
      message: '有什麼美食推薦？',
      description: '測試美食意圖分類和餐飲商家推薦'
    },
    {
      name: '英語學習測試',
      message: '我想學英語',
      description: '測試英語學習意圖，應該推薦肯塔基美語'
    },
    {
      name: '停車場查詢測試',
      message: '附近有停車場嗎？',
      description: '測試停車場意圖分類'
    },
    {
      name: '一般查詢測試',
      message: '文山特區有什麼好玩的？',
      description: '測試一般意圖分類'
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    console.log(`📋 測試: ${testCase.name}`);
    console.log(`📝 描述: ${testCase.description}`);
    console.log(`💬 訊息: "${testCase.message}"`);
    
    try {
      const testMessage = {
        session_id: `test-session-${Date.now()}`,
        message: {
          role: 'user',
          content: testCase.message
        },
        user_meta: {
          external_id: 'test-user',
          display_name: '測試用戶',
          avatar_url: ''
        }
      };

      console.log('📤 發送請求...');
      
      const response = await fetch(SMART_ACTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(testMessage)
      });
      
      console.log(`📊 狀態碼: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📄 回應格式檢查:`);
        console.log(`   - response: ${data.response ? '✅' : '❌'}`);
        console.log(`   - session_id: ${data.session_id ? '✅' : '❌'}`);
        console.log(`   - intent: ${data.intent ? '✅' : '❌'}`);
        console.log(`   - recommended_stores: ${data.recommended_stores ? '✅' : '❌'}`);
        console.log(`   - version: ${data.version ? '✅' : '❌'}`);
        
        console.log(`🎯 意圖: ${data.intent || '未知'}`);
        console.log(`🏪 推薦商家數量: ${data.recommended_stores?.length || 0}`);
        console.log(`🔧 版本: ${data.version || '未知'}`);
        
        if (data.response) {
          console.log(`🤖 AI回應預覽: ${data.response.substring(0, 100)}...`);
        }
        
        if (data.debug) {
          console.log(`🔍 調試資訊:`, JSON.stringify(data.debug, null, 2));
        }
        
        // 檢查是否為有效回應
        if (data.response && data.session_id) {
          console.log('✅ 測試通過');
          passedTests++;
        } else {
          console.log('❌ 回應格式不完整');
        }
        
      } else {
        const errorText = await response.text();
        console.log(`❌ 請求失敗: ${errorText}`);
      }
      
    } catch (error) {
      console.log('❌ 測試異常');
      console.log(`   錯誤: ${error.message}`);
    }
    
    console.log('─'.repeat(60));
  }

  // 測試總結
  console.log('\n📊 smart-action Edge Function 測試總結');
  console.log(`✅ 通過: ${passedTests}/${totalTests}`);
  console.log(`❌ 失敗: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 smart-action Edge Function 測試全部通過！');
    console.log('✅ 前端可以安全使用 smart-action 作為 API 端點');
  } else if (passedTests > 0) {
    console.log('\n⚠️ 部分測試通過，建議檢查失敗的測試案例');
  } else {
    console.log('\n❌ 所有測試失敗，請檢查 Edge Function 配置');
  }
}

// 執行測試
testSmartActionFinal().catch(console.error);
