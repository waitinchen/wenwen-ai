/**
 * 使用正確的 API Key 測試 smart-action Edge Function
 */

const SMART_ACTION_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/smart-action';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

async function testSmartActionWithCorrectKey() {
  console.log('🧪 使用正確 API Key 測試 smart-action Edge Function\n');
  console.log(`🔗 URL: ${SMART_ACTION_URL}\n`);

  const testMessage = {
    session_id: `test-session-${Date.now()}`,
    message: {
      role: 'user',
      content: '有什麼美食推薦？'
    },
    user_meta: {
      external_id: 'test-user',
      display_name: '測試用戶',
      avatar_url: ''
    }
  };

  try {
    console.log('📤 發送測試請求...');
    console.log('📄 請求內容:', JSON.stringify(testMessage, null, 2));
    
    const response = await fetch(SMART_ACTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(testMessage)
    });
    
    console.log(`📊 狀態碼: ${response.status} ${response.statusText}`);
    console.log(`📋 標頭:`, Object.fromEntries(response.headers.entries()));
    
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`📄 回應內容:`, JSON.stringify(data, null, 2));
      
      // 檢查是否為 wen-v2 格式
      if (data.response && data.session_id && data.intent) {
        console.log('✅ 檢測到 wen-v2 相容格式');
        console.log(`🎯 意圖: ${data.intent}`);
        console.log(`🏪 推薦商家數量: ${data.recommended_stores?.length || 0}`);
        console.log(`🔧 引擎版本: ${data.version || '未知'}`);
        console.log(`🤖 AI回應: ${data.response.substring(0, 200)}...`);
        
        if (data.debug) {
          console.log(`🔍 調試資訊:`, JSON.stringify(data.debug, null, 2));
        }
      } else {
        console.log('⚠️ 回應格式與 wen-v2 不相符');
      }
    } else {
      const text = await response.text();
      console.log(`📄 回應內容: ${text}`);
    }
    
    if (response.ok) {
      console.log('✅ 測試通過');
    } else {
      console.log('❌ 測試失敗');
    }
    
  } catch (error) {
    console.log('❌ 測試異常');
    console.log(`   錯誤: ${error.message}`);
  }
}

async function testMultipleScenarios() {
  console.log('\n🔗 測試多種情境\n');

  const scenarios = [
    {
      name: '美食推薦',
      message: '有什麼美食推薦？',
      expectedIntent: 'FOOD'
    },
    {
      name: '英語學習',
      message: '我想學英語',
      expectedIntent: 'ENGLISH_LEARNING'
    },
    {
      name: '停車場查詢',
      message: '附近有停車場嗎？',
      expectedIntent: 'PARKING'
    },
    {
      name: '一般查詢',
      message: '文山特區有什麼好玩的？',
      expectedIntent: 'GENERAL'
    }
  ];

  for (const scenario of scenarios) {
    console.log(`📋 測試情境: ${scenario.name}`);
    console.log(`💬 訊息: "${scenario.message}"`);
    
    try {
      const testMessage = {
        session_id: `test-session-${Date.now()}`,
        message: {
          role: 'user',
          content: scenario.message
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
        console.log(`🎯 意圖: ${data.intent} (預期: ${scenario.expectedIntent})`);
        console.log(`🏪 商家數量: ${data.recommended_stores?.length || 0}`);
        console.log(`🔧 版本: ${data.version || '未知'}`);
        
        if (data.intent === scenario.expectedIntent) {
          console.log('✅ 意圖分類正確');
        } else {
          console.log('⚠️ 意圖分類不符預期');
        }
      } else {
        console.log(`❌ 請求失敗: ${response.status} ${response.statusText}`);
      }
      
    } catch (error) {
      console.log(`❌ 測試異常: ${error.message}`);
    }
    
    console.log('─'.repeat(40));
  }
}

async function runFullTest() {
  console.log('🚀 開始 smart-action Edge Function 完整測試\n');
  
  // 基本功能測試
  await testSmartActionWithCorrectKey();
  
  // 多情境測試
  await testMultipleScenarios();
  
  console.log('\n🎯 測試完成！');
  console.log('📝 總結:');
  console.log('- 如果 smart-action 回應 wen-v2 格式，可以作為替代方案');
  console.log('- 如果回應格式不同，需要確認是否為正確的 Edge Function');
  console.log('- 建議確認 smart-action 的實際功能');
}

// 執行測試
runFullTest().catch(console.error);
